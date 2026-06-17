#!/usr/bin/env python3
"""
Dashboard Data Fetcher
Fetches ~180 constants from free public APIs (no API key required).

Usage:
    python tools/fetch_dashboard_data.py BIH
    python tools/fetch_dashboard_data.py BA
    python tools/fetch_dashboard_data.py KAZ

Accepts ISO 3166 Alpha-2 (2 letters) or Alpha-3 (3 letters) only.
All country metadata (name, capital, coordinates, UN numeric ID)
is resolved automatically from public APIs — no lookup table.

Sources:
    - World Bank Open Data API      (name, capital, indicators)
    - REST Countries API            (UN numeric code, capital lat/lon, currency, languages, borders)
    - Nominatim / OpenStreetMap     (capital coordinates fallback)
    - IMF WEO DataMapper API
    - UNDP HDR API
    - UN World Population Prospects API
    - WHO Global Health Observatory API
    - Wikidata SPARQL               (highest/lowest point, head of state, cities, UNESCO sites)
    - ILO ILOSTAT API               (sector wages)
    - Frankfurter API               (USD exchange rate)
    - Open-Meteo Archive API        (climate normals 1991-2020)
    - World Bank WGI API            (governance indicators via source=3)
    - transparency.org              (TI CPI — page scrape to find xlsx link, then xlsx parse)
    - freedomhouse.org              (Freedom House — direct xlsx download + parse)
    - Local indexes.csv             (GPI, RSF, WJP — updated annually; TI CPI / FH fallback)
"""

import sys
import json
import time
import csv
import os
import requests
from datetime import datetime
from collections import defaultdict

# ──────────────────────────────────────────────────────────────────────────────
# CONFIG
# Loaded from fetch_config.json next to this script.
# Edit that file to update year-sensitive or fragile URLs without touching code.
# ──────────────────────────────────────────────────────────────────────────────
_CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'fetch_config.json')
try:
    with open(_CONFIG_PATH, encoding='utf-8') as _f:
        _CFG = json.load(_f)
    print(f'  Config loaded from {_CONFIG_PATH}')
except FileNotFoundError:
    print(f'  ⚠  fetch_config.json not found at {_CONFIG_PATH} — using built-in defaults')
    _CFG = {}

def _cfg(*keys, default=None):
    """Read a nested config value: _cfg('ti_cpi', 'year') → _CFG['ti_cpi']['year']"""
    node = _CFG
    for k in keys:
        if not isinstance(node, dict) or k not in node:
            return default
        node = node[k]
    return node

# ──────────────────────────────────────────────────────────────────────────────
# COUNTRY RESOLUTION
#
# All country metadata resolved automatically from the ISO input — no lookup table.
#
# Step 1 — World Bank country API (REST, JSON, no auth)
#   GET https://api.worldbank.org/v2/country/{iso}?format=json
#   → canonical name, iso2, iso3, capital city name
#
# Step 2 — REST Countries API (REST, JSON, no auth)
#   GET https://restcountries.com/v3.1/alpha/{iso2}
#   → UN numeric code (ccn3), capital lat/lon (capitalInfo.latlng),
#     currency code + name, official language(s), bordering countries (ISO3 list)
#
# Step 3 — Nominatim / OpenStreetMap (REST, JSON, no auth) — fallback only
#   GET https://nominatim.openstreetmap.org/search?q={capital},{country}&format=json
#   Used when REST Countries returns no coordinates (happens for some small states).
#   Nominatim policy: 1 req/sec max; User-Agent required.
# ──────────────────────────────────────────────────────────────────────────────

# ──────────────────────────────────────────────────────────────────────────────
# WORLD BANK INDICATORS
# key = output field name, value = WB indicator code
# ──────────────────────────────────────────────────────────────────────────────
WB_INDICATORS = {
    # ── Economy ──
    'gdp_usd':                      'NY.GDP.MKTP.CD',
    'gdp_per_capita_usd':           'NY.GDP.PCAP.CD',
    'gdp_growth_pct':               'NY.GDP.MKTP.KD.ZG',
    'gdp_ppp_usd':                  'NY.GDP.MKTP.PP.CD',
    'gdp_per_capita_ppp':           'NY.GDP.PCAP.PP.CD',
    'gni_per_capita_atlas':         'NY.GNP.PCAP.CD',
    'inflation_cpi_pct':            'FP.CPI.TOTL.ZG',
    'services_pct_gdp':             'NV.SRV.TOTL.ZS',
    'industry_pct_gdp':             'NV.IND.TOTL.ZS',
    'manufacturing_pct_gdp':        'NV.IND.MANF.ZS',
    'agriculture_pct_gdp':          'NV.AGR.TOTL.ZS',
    'exports_pct_gdp':              'NE.EXP.GNFS.ZS',
    'imports_pct_gdp':              'NE.IMP.GNFS.ZS',
    'trade_pct_gdp':                'NE.TRD.GNFS.ZS',
    'fdi_inflow_pct_gdp':           'BX.KLT.DINV.WD.GD.ZS',
    'fdi_inflow_usd':               'BX.KLT.DINV.CD.WD',
    'remittances_pct_gdp':          'BX.TRF.PWKR.DT.GD.ZS',
    'remittances_usd':              'BX.TRF.PWKR.CD.DT',
    'current_account_pct_gdp':      'BN.CAB.XOKA.GD.ZS',
    'tax_revenue_pct_gdp':          'GC.TAX.TOTL.GD.ZS',
    'govt_expenditure_pct_gdp':     'GC.XPN.TOTL.GD.ZS',
    'govt_debt_pct_gdp':            'GC.DOD.TOTL.GD.ZS',
    'gross_savings_pct_gdp':        'NY.GNS.ICTR.ZS',
    'gross_capital_formation_pct':  'NE.GDI.TOTL.ZS',

    # ── Population & Demographics ──
    'population_total':             'SP.POP.TOTL',
    'population_density_per_km2':   'EN.POP.DNST',           # ❌ BIH: no data returned — WB does not publish this for BiH
    'urban_population_pct':         'SP.URB.TOTL.IN.ZS',
    'urban_population_total':       'SP.URB.TOTL',
    'rural_population_pct':         'SP.RUR.TOTL.ZS',
    'pop_0_14_pct':                 'SP.POP.0014.TO.ZS',
    'pop_15_64_pct':                'SP.POP.1564.TO.ZS',
    'pop_65plus_pct':               'SP.POP.65UP.TO.ZS',
    'pop_female_pct':               'SP.POP.TOTL.FE.ZS',     # ❌ BIH: indicator exists globally but not returned for BiH
    'birth_rate_per1k':             'SP.DYN.CBRT.IN',
    'death_rate_per1k':             'SP.DYN.CDRT.IN',
    'fertility_rate':               'SP.DYN.TFRT.IN',
    'net_migration':                'SM.POP.NETM',           # ❌ BIH: data exists but all recent values null — last reported 2017
    'international_migrants_pct':   'SM.POP.TOTL.ZS',

    # ── Health & Vital Statistics ──
    'life_expectancy_total':        'SP.DYN.LE00.IN',
    'life_expectancy_female':       'SP.DYN.LE00.FE.IN',
    'life_expectancy_male':         'SP.DYN.LE00.MA.IN',
    'infant_mortality_per1k':       'SP.DYN.IMRT.IN',
    'under5_mortality_per1k':       'SH.DYN.MORT',
    'maternal_mortality_per100k':   'SH.STA.MMRT',
    'tb_incidence_per100k':         'SH.TBS.INCD',
    'hiv_prevalence_pct':           'SH.DYN.AIDS.ZS',        # ❌ BIH: suppressed — prevalence below reportable threshold (<0.1%)
    'health_expenditure_pct_gdp':   'SH.XPD.CHEX.GD.ZS',
    'health_exp_per_capita_usd':    'SH.XPD.CHEX.PC.CD',
    'out_of_pocket_health_pct':     'SH.XPD.OOPC.CH.ZS',
    'physicians_per1k':             'SH.MED.PHYS.ZS',
    'hospital_beds_per1k':          'SH.MED.BEDS.ZS',
    'nurses_per1k':                 'SH.MED.NUMW.P3',
    'access_clean_water_pct':       'SH.H2O.SMDW.ZS',
    'access_sanitation_pct':        'SH.STA.SMSS.ZS',
    'stunting_pct_under5':          'SH.STA.STNT.ME.ZS',
    'obesity_prevalence_pct':       'SH.STA.OWGH.ZS',

    # ── Education ──
    'literacy_rate_adult_pct':      'SE.ADT.LITR.ZS',
    'literacy_rate_youth_pct':      'SE.ADT.1524.LT.ZS',
    'school_enrollment_primary_pct':'SE.PRM.NENR',           # ❌ BIH: net enrollment not reported — use gross (SE.PRM.ENRR) if needed
    'school_enrollment_secondary_pct':'SE.SEC.NENR',         # ❌ BIH: net enrollment not reported — use gross (SE.SEC.ENRR) if needed
    'school_enrollment_tertiary_pct':'SE.TER.ENRR',
    'education_expenditure_pct_gdp':'SE.XPD.TOTL.GD.ZS',
    'primary_completion_rate_pct':  'SE.PRM.CMPT.ZS',
    'pupil_teacher_ratio_primary':  'SE.PRM.ENRL.TC.ZS',

    # ── Labour ──
    'unemployment_pct':             'SL.UEM.TOTL.ZS',
    'youth_unemployment_pct':       'SL.UEM.1524.ZS',
    'female_unemployment_pct':      'SL.UEM.TOTL.FE.ZS',
    'labour_force_participation_pct':'SL.TLF.CACT.ZS',
    'female_labour_force_pct':      'SL.TLF.CACT.FE.ZS',
    'vulnerable_employment_pct':    'SL.EMP.VULN.ZS',
    'employment_agriculture_pct':   'SL.AGR.EMPL.ZS',
    'employment_industry_pct':      'SL.IND.EMPL.ZS',
    'employment_services_pct':      'SL.SRV.EMPL.ZS',
    'wage_workers_pct':             'SL.EMP.WORK.ZS',

    # ── Social & Governance ──
    'gini_index':                   'SI.POV.GINI',
    'poverty_headcount_365_pct':    'SI.POV.LMIC',
    'poverty_headcount_215_pct':    'SI.POV.DDAY',           # ❌ BIH: $2.15/day poverty too low for BiH income level — all values null
    'women_in_parliament_pct':      'SG.GEN.PARL.ZS',
    # WGI indicators (RL.EST, GE.EST, CC.EST, VA.EST, PV.EST, RQ.EST) are fetched
    # separately via fetch_wgi() using ?source=3 on the WB API — not listed here.

    # ── Environment ──
    'co2_per_capita_tons':          'EN.ATM.CO2E.PC',        # ❌ BIH: CO2 data lags ~3 years — last available 2020; mrv=5 still returns null
    'co2_total_kt':                 'EN.ATM.CO2E.KT',        # ❌ BIH: same lag issue — try mrv=10 or use IEA manually
    'pm25_mean_annual_ugm3':        'EN.ATM.PM25.MC.M3',
    'forest_area_pct':              'AG.LND.FRST.ZS',
    'forest_area_km2':              'AG.LND.FRST.K2',
    'arable_land_pct':              'AG.LND.ARBL.ZS',
    'agricultural_land_pct':        'AG.LND.AGRI.ZS',
    'renewable_freshwater_per_cap': 'ER.H2O.INTR.PC',

    # ── Energy ──
    'access_electricity_pct':       'EG.ELC.ACCS.ZS',
    'renewable_electricity_pct':    'EG.ELC.RNEW.ZS',
    'electric_power_kwh_per_cap':   'EG.USE.ELEC.KH.PC',
    'energy_use_kg_oil_per_cap':    'EG.USE.PCAP.KG.OE',
    'fossil_fuel_energy_pct':       'EG.USE.COMM.FO.ZS',

    # ── Infrastructure & Digital ──
    'internet_users_pct':           'IT.NET.USER.ZS',
    'mobile_subscriptions_per100':  'IT.CEL.SETS.P2',
    'fixed_broadband_per100':       'IT.NET.BBND.P2',
    'secure_internet_servers_per1m':'IT.NET.SECR.P6',
    'roads_paved_pct':              'IS.ROD.PAVE.ZS',        # ❌ BIH: WB stopped updating this indicator — last global data ~2010
    'air_transport_passengers':     'IS.AIR.PSGR',

    # ── Crime & Safety ──
    'homicide_rate_per100k':        'VC.IHR.PSRC.P5',

    # ── Geography ──
    'area_km2':                     'AG.SRF.TOTL.K2',

    # ── Fiscal / Trade ──
    'foreign_reserves_usd':         'FI.RES.TOTL.CD',
    'exports_usd':                  'BX.GSR.TOTL.CD',
    'imports_usd':                  'BM.GSR.TOTL.CD',

    # ── Health — Causes of Death ──
    'death_communicable_pct':       'SH.DTH.COMM.ZS',
    'death_noncommunicable_pct':    'SH.DTH.NCOM.ZS',
    'death_injury_pct':             'SH.DTH.INJR.ZS',

    # ── Energy mix ──
    'electricity_coal_pct':         'EG.ELC.COAL.ZS',
    'electricity_gas_pct':          'EG.ELC.NGAS.ZS',
    'electricity_hydro_pct':        'EG.ELC.HYRO.ZS',
    'electricity_nuclear_pct':      'EG.ELC.NUCL.ZS',
    'electricity_renewables_excl_hydro_pct': 'EG.ELC.RNWX.ZS',

    # ── Poverty (upper-middle income line) ──
    'poverty_headcount_685_pct':    'SI.POV.UMIC',

    # ── Tourism ──
    'tourism_arrivals':             'ST.INT.ARVL',
    'tourism_receipts_usd':         'ST.INT.RCPT.CD',
    'tourism_departures':           'ST.INT.DPRT',           # ❌ BIH: UNWTO does not report outbound departures for BiH
    'tourism_expenditure_usd':      'ST.INT.XPND.CD',
}

# ──────────────────────────────────────────────────────────────────────────────
# IMF WEO INDICATORS
# ──────────────────────────────────────────────────────────────────────────────
IMF_INDICATORS = {
    'imf_inflation_pct':            'PCPIPCH',
    'imf_gdp_growth_pct':           'NGDP_RPCH',
    'imf_gdp_per_capita_usd':       'NGDPDPC',
    'imf_gdp_ppp_bn':               'PPPGDP',
    'imf_gdp_per_capita_ppp':       'PPPPC',
    'imf_govt_debt_pct_gdp':        'GGXWDG_NGDP',
    'imf_fiscal_balance_pct_gdp':   'GGXCNL_NGDP',
    'imf_current_account_pct_gdp':  'BCA_NGDPD',
    'imf_unemployment_pct':         'LUR',
    'imf_output_gap_pct':           'NGAP_NPGDP',            # ❌ ALL: IMF does not publish output gap estimates for small/transition economies incl. BiH
    'imf_current_account_usd_bn':   'BCA',
}

# ──────────────────────────────────────────────────────────────────────────────
# HTTP SESSION
# ──────────────────────────────────────────────────────────────────────────────
SESSION = requests.Session()
SESSION.headers.update({
    'User-Agent': 'DashboardDataFetcher/1.0 (educational/research use)',
    'Accept': 'application/json',
})

# ──────────────────────────────────────────────────────────────────────────────
# FETCH: WORLD BANK
#
# Protocol : HTTPS REST
# Auth     : none
# Request  : GET https://api.worldbank.org/v2/country/{iso2}/indicator/{code}
#              ?format=json&mrv=5&per_page=5
#            mrv=5 returns the 5 most recent values — picks first non-null.
# Response : JSON array of 2 elements: [metadata, [datapoints]]
#            Each datapoint: { "date": "2023", "value": 42.1, ... }
# Limits   : 500 req/min unauthenticated; no key needed.
# ──────────────────────────────────────────────────────────────────────────────
def fetch_worldbank(iso2, indicator_code, field_name):
    url = (
        f'https://api.worldbank.org/v2/country/{iso2}/indicator/{indicator_code}'
        f'?format=json&mrv=5&per_page=5'
    )
    try:
        r = SESSION.get(url, timeout=15)
        r.raise_for_status()
        body = r.json()
        if len(body) < 2 or not body[1]:
            return None
        for entry in body[1]:
            if entry.get('value') is not None:
                return {
                    'status':    1,
                    'value':     entry['value'],
                    'year':      entry['date'],
                    'source':    'World Bank Open Data',
                    'indicator': indicator_code,
                    'url':       f'https://data.worldbank.org/indicator/{indicator_code}',
                }
        return None
    except Exception as e:
        return None

# ──────────────────────────────────────────────────────────────────────────────
# FETCH: IMF WEO
#
# Protocol : HTTPS REST
# Auth     : none
# Request  : GET https://www.imf.org/external/datamapper/api/v1/{indicator}/{iso3}
# Response : JSON { "values": { "{indicator}": { "{iso3}": { "2023": 3.2, ... } } } }
#            Includes historical data AND forward projections (up to ~5 years).
#            Script picks the most recent non-null year — may be a forecast year.
# Note     : WEO is published twice a year (Apr, Oct). No key required.
# ──────────────────────────────────────────────────────────────────────────────
def fetch_imf(iso3, indicator_code, field_name):
    url = f'https://www.imf.org/external/datamapper/api/v1/{indicator_code}/{iso3}'
    try:
        r = SESSION.get(url, timeout=15)
        r.raise_for_status()
        body = r.json()
        values = body.get('values', {}).get(indicator_code, {}).get(iso3, {})
        if not values:
            return None
        for yr in sorted(values.keys(), reverse=True):
            if values[yr] is not None:
                return {
                    'status':    1,
                    'value':     values[yr],
                    'year':      yr,
                    'source':    'IMF WEO',
                    'indicator': indicator_code,
                    'url':       f'https://www.imf.org/external/datamapper/{indicator_code}',
                }
        return None
    except Exception as e:
        return None

# ──────────────────────────────────────────────────────────────────────────────
# FETCH: UNDP HDR
#
# Protocol : HTTPS REST
# Auth     : none
# Request  : GET https://api.hdr.undp.org/v3/combination/countries/{iso3}
# Response : JSON { "data": { "indicators": [ { "id", "name", "value": [...] } ] } }
#            Returns all HDR indicators for the country in one call.
#            Script picks the most recent non-null year per indicator.
# Note     : HDR published annually (usually Sep). Covers HDI, GII, MPI,
#            mean/expected years of schooling, income index, and ~30 more.
# ──────────────────────────────────────────────────────────────────────────────
def fetch_undp(iso3):
    undp_tpl = _cfg('undp', 'base_url',
                    default='https://api.hdr.undp.org/{api_version}/combination/countries/{iso3}')
    url = undp_tpl.format(api_version=_cfg('undp', 'api_version', default='v3'), iso3=iso3)
    try:
        r = SESSION.get(url, timeout=20)
        r.raise_for_status()
        body = r.json()
        results = {}
        indicators = body.get('data', {}).get('indicators', [])
        for ind in indicators:
            code = ind.get('id', '')
            name = ind.get('name', '')
            vals = ind.get('value', [])
            if not vals:
                continue
            latest = sorted(vals, key=lambda x: x.get('year', 0), reverse=True)[0]
            if latest.get('value') is None:
                continue
            results[f'undp_{code.lower()}'] = {
                'status':    1,
                'value':     latest['value'],
                'year':      str(latest.get('year', '')),
                'source':    'UNDP Human Development Report',
                'indicator': code,
                'label':     name,
                'url':       f'https://hdr.undp.org/data-center/specific-country-data#/countries/{iso3}',
            }
        return results
    except Exception as e:
        print(f'  ⚠  UNDP: {e}')
        return {}

# ──────────────────────────────────────────────────────────────────────────────
# FETCH: UN WORLD POPULATION PROSPECTS
#
# Protocol : HTTPS REST
# Auth     : none
# Request  : GET https://population.un.org/dataportalapi/api/v1/data/indicators
#              /{indicator_id}/locations/{un_numeric}/start/2020/end/2025
#              ?format=json&pageNumber=1&pageSize=5&sortBy=TimeMid&sortOrder=desc
#            Uses UN numeric country code (not ISO3) — resolved via REST Countries.
# Response : JSON { "data": [ { "value", "timeLabel", ... } ] }
#            Covers 5-year period estimates; script takes the most recent row.
# Note     : WPP 2024 edition. Published every 2 years. Requires UN numeric ID
#            (ccn3) — countries missing from REST Countries response are skipped.
# ──────────────────────────────────────────────────────────────────────────────
def fetch_un_wpp(un_numeric):
    results = {}
    # indicator_id → field_name, label
    indicators = {
        68:  ('median_age',                   'Median Age'),
        55:  ('total_fertility_rate',          'Total Fertility Rate'),
        57:  ('net_migration_rate',            'Net Migration Rate per 1000'),
        59:  ('natural_increase_rate',         'Natural Increase Rate per 1000'),
        61:  ('population_growth_rate_pct',    'Population Growth Rate %'),
        67:  ('pop_sex_ratio',                 'Sex Ratio (males per 100 females)'),
    }
    base       = _cfg('un_wpp', 'base_url', default='https://population.un.org/dataportalapi/api/v1')
    wpp_start  = _cfg('un_wpp', 'start_year', default=2020)
    wpp_end    = _cfg('un_wpp', 'end_year',   default=2025)
    for ind_id, (field, label) in indicators.items():
        url = (
            f'{base}/data/indicators/{ind_id}/locations/{un_numeric}'
            f'/start/{wpp_start}/end/{wpp_end}?format=json&pageNumber=1&pageSize=5'
            f'&sortBy=TimeMid&sortOrder=desc'
        )
        try:
            r = SESSION.get(url, timeout=20)
            r.raise_for_status()
            body = r.json()
            rows = body.get('data', [])
            if rows:
                row = rows[0]
                results[field] = {
                    'status': 1,
                    'value':  row.get('value'),
                    'year':   str(row.get('timeLabel', '')),
                    'source': 'UN World Population Prospects 2024',
                    'label':  label,
                    'url':    'https://population.un.org/wpp/',
                }
        except Exception as e:
            pass
        time.sleep(0.3)
    return results

# ──────────────────────────────────────────────────────────────────────────────
# FETCH: TI CORRUPTION PERCEPTIONS INDEX (auto, from transparency.org)
#
# Protocol : HTTPS — two-step: HTML scrape → binary file download → XML parse
# Auth     : none (browser-like User-Agent required to avoid soft blocks)
# Step 1   : GET https://www.transparency.org/en/cpi/{year}  (HTML)
#            Regex-extract the .xlsx download link from page source.
#            The filename changes every year (TI has no stable URL), e.g.:
#              2024 → CPI2024-Results-and-trends.xlsx
#              2023 → CPI2023_Global_Results__Trends.xlsx
# Step 2   : GET the extracted .xlsx URL → follows 307 redirect to CDN
#            Response: binary OOXML (.xlsx = ZIP of XML files)
# Step 3   : Parse with stdlib zipfile + xml.etree (no openpyxl needed).
#            TI uses a non-standard namespace URI (purl.oclc.org instead of
#            the ECMA standard) — namespace is detected dynamically from
#            sharedStrings.xml to avoid hardcoding.
#            Columns: Country/Territory, ISO3, Region, CPI {year} score, Rank
# Fallback : None → fetch_indexes() uses CSV row instead.
# ──────────────────────────────────────────────────────────────────────────────
import io
import re
import zipfile
import xml.etree.ElementTree as ET

_TI_HEADERS = {
    'User-Agent': (
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
        'AppleWebKit/537.36 (KHTML, like Gecko) '
        'Chrome/124.0.0.0 Safari/537.36'
    ),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

def _parse_xlsx_for_cpi(xlsx_bytes, iso3, year):
    """Parse CPI xlsx bytes (stdlib only). Returns (score, rank) or (None, None)."""
    with zipfile.ZipFile(io.BytesIO(xlsx_bytes)) as z:
        # Detect the actual namespace from sharedStrings (TI uses a non-standard URI)
        with z.open('xl/sharedStrings.xml') as f:
            ss_raw = f.read()
        ns_match = re.search(rb'xmlns=["\']([^"\']+)["\']', ss_raw)
        ns_uri = ns_match.group(1).decode() if ns_match else \
            'http://schemas.openxmlformats.org/spreadsheetml/2006/main'

        ss_tree = ET.fromstring(ss_raw)
        shared = [
            ''.join(t.text or '' for t in si.iter(f'{{{ns_uri}}}t'))
            for si in ss_tree
        ]

        def cell_value(c):
            """Return the string value of a cell element."""
            t    = c.get('t', '')
            v_el = c.find(f'{{{ns_uri}}}v')
            if v_el is None:
                return ''
            raw = v_el.text or ''
            if t == 's':
                try:
                    return shared[int(raw)]
                except (ValueError, IndexError):
                    return raw
            return raw

        with z.open('xl/worksheets/sheet1.xml') as f:
            ws_tree = ET.parse(f)

        rows = ws_tree.getroot().findall(f'.//{{{ns_uri}}}row')

        # Find the header row (contains "ISO3")
        header_idx  = None
        iso3_col    = None
        score_col   = None
        rank_col    = None
        col_headers = []

        for i, row in enumerate(rows):
            cells = row.findall(f'{{{ns_uri}}}c')
            values = [cell_value(c) for c in cells]
            if 'ISO3' in values:
                header_idx = i
                col_headers = values
                iso3_col  = values.index('ISO3')
                # Score column: "CPI {year} score" or similar
                for j, h in enumerate(values):
                    hl = h.lower()
                    if 'score' in hl and str(year) in hl:
                        score_col = j
                    if h.lower() == 'rank':
                        rank_col = j
                break

        if header_idx is None or iso3_col is None:
            return None, None

        for row in rows[header_idx + 1:]:
            cells  = row.findall(f'{{{ns_uri}}}c')
            # Cells may be sparse — map column index from the 'r' attribute
            col_map = {}
            for c in cells:
                ref = c.get('r', '')
                # Convert column letter(s) to 0-based index
                letters = re.match(r'([A-Z]+)', ref)
                if letters:
                    idx = 0
                    for ch in letters.group(1):
                        idx = idx * 26 + (ord(ch) - ord('A') + 1)
                    col_map[idx - 1] = cell_value(c)

            if col_map.get(iso3_col, '').upper() == iso3.upper():
                score_raw = col_map.get(score_col, '') if score_col is not None else ''
                rank_raw  = col_map.get(rank_col,  '') if rank_col  is not None else ''
                try:
                    score = float(score_raw) if score_raw else None
                except ValueError:
                    score = None
                try:
                    rank = int(float(rank_raw)) if rank_raw else None
                except ValueError:
                    rank = None
                return score, rank

    return None, None


def fetch_ti_cpi_live(iso3, year=None):
    """
    Fetch TI CPI score and rank for iso3.
    If ti_cpi.xlsx_url is set in fetch_config.json the xlsx is downloaded directly
    (no HTML scrape). Otherwise falls back to scraping ti_cpi.page_url to find the link.
    Returns a result dict or None.
    """
    if year is None:
        year = _cfg('ti_cpi', 'year', default=datetime.now().year)

    label    = 'TI Corruption Perceptions Index'
    note     = 'higher = less corrupt'
    xlsx_url = _cfg('ti_cpi', 'xlsx_url', default='')

    def _download_and_parse(url, try_year):
        try:
            xr = SESSION.get(url, headers=_TI_HEADERS, timeout=60, allow_redirects=True)
            xr.raise_for_status()
        except Exception as e:
            print(f'  ⚠  TI CPI xlsx download failed: {e}')
            return None
        score, rank = _parse_xlsx_for_cpi(xr.content, iso3, try_year)
        if score is None:
            print(f'  ⚠  TI CPI: {iso3} not found in {try_year} xlsx')
            return None
        result = {
            'status': 1,
            'value':  score,
            'year':   str(try_year),
            'source': label,
            'label':  f'{label} ({note})',
            'url':    f'https://www.transparency.org/en/cpi/{try_year}',
        }
        if rank is not None:
            result['rank'] = rank
        return result

    if not xlsx_url:
        print(f'  ⚠  TI CPI: no xlsx_url set in fetch_config.json — skipping')
        return None

    print(f'  TI CPI: downloading xlsx from config URL')
    return _download_and_parse(xlsx_url, year)


# ──────────────────────────────────────────────────────────────────────────────
# FETCH: LOCAL INDEXES CSV
#
# Protocol : local file read — no network call
# Format   : CSV with comment lines (#), columns: iso3, {index}_score,
#            {index}_rank, {index}_year for each of: ti_cpi, gpi, fh, rsf, wjp
# File     : data/indexes.csv — maintained manually once a year.
# Why CSV  : GPI requires registration (IEP data licensing), RSF blocks all
#            programmatic access (HTTP 403), WJP has no accessible data file.
#            TI CPI and Freedom House are auto-fetched — CSV is their fallback.
# Update   : Jan (TI CPI), Feb (FH), May (RSF), Jun (GPI), Oct (WJP).
# ──────────────────────────────────────────────────────────────────────────────
_INDEXES_CSV = os.path.join(
    os.path.dirname(__file__), '..', 'data', 'indexes.csv'
)

_INDEX_META = {
    'ti_cpi':  ('TI Corruption Perceptions Index',   'https://www.transparency.org/en/cpi',             0, 100, 'higher = less corrupt'),
    'gpi':     ('Global Peace Index',                'https://www.visionofhumanity.org/maps/',           1, 5,   'lower = more peaceful'),
    'fh':      ('Freedom House Freedom in the World', 'https://freedomhouse.org/report/freedom-world',   0, 100, 'higher = more free'),
    'rsf':     ('RSF Press Freedom Index',            'https://rsf.org/en/index',                        0, 100, 'higher = more press freedom'),
    'wjp':     ('WJP Rule of Law Index',              'https://worldjusticeproject.org/rule-of-law-index', 0, 1, 'higher = stronger rule of law'),
}

# ──────────────────────────────────────────────────────────────────────────────
# FETCH: FREEDOM HOUSE — Freedom in the World (direct xlsx download)
#
# Protocol : HTTPS — binary file download → XML parse (same as TI CPI)
# Auth     : none (browser-like User-Agent required)
# URL      : https://freedomhouse.org/sites/default/files/{year}-02/
#              All_data_FIW_2013-{year-1}.xlsx
#            Published every February. Pattern: pub year in path, data year in
#            filename. Tries current year then year-1 automatically.
# Format   : xlsx (OOXML ZIP). Sheet2 contains all country-year data.
#            Columns: Country/Territory, Region, C/T, Edition (=data year),
#            Status (Free/Partly Free/Not Free), PR rating (0-40),
#            CL rating (0-60), subcategory scores A1-G4, Total (0-100).
# Match    : by Country/Territory name string (FH uses no ISO codes).
#            _FH_NAME_OVERRIDES maps ISO3 → FH name for WB name mismatches.
# Fallback : None → fetch_indexes() uses CSV row instead.
# Source   : Same URL used by xmarquez/democracyData download_fh_full().
# ──────────────────────────────────────────────────────────────────────────────

# ISO3 → FH country name overrides (where World Bank name ≠ FH name)
_FH_NAME_OVERRIDES = {
    'KGZ': 'Kyrgyzstan',                    # WB: Kyrgyz Republic
    'RUS': 'Russia',                         # WB: Russian Federation
    'SYR': 'Syria',                          # WB: Syrian Arab Republic
    'IRN': 'Iran',                           # WB: Iran, Islamic Rep.
    'LAO': 'Laos',                           # WB: Lao PDR
    'KOR': 'South Korea',                    # WB: Korea, Rep.
    'PRK': 'North Korea',                    # WB: Korea, Dem. People's Rep.
    'COD': 'Democratic Republic of Congo',   # WB: Congo, Dem. Rep.
    'COG': 'Republic of Congo',              # WB: Congo, Rep.
    'EGY': 'Egypt',                          # WB: Egypt, Arab Rep.
    'FSM': 'Micronesia',                     # WB: Micronesia, Fed. Sts.
    'SVK': 'Slovakia',                       # WB: Slovak Republic
    'VEN': 'Venezuela',                      # WB: Venezuela, RB
    'YEM': 'Yemen',                          # WB: Yemen, Rep.
    'PSE': 'West Bank and Gaza Strip',       # WB: West Bank and Gaza
    'MKD': 'North Macedonia',               # WB: North Macedonia (usually matches)
}


def _parse_xlsx_for_fh(xlsx_bytes, fh_name):
    """Parse FH All Data xlsx (stdlib only). Returns result dict or None."""
    try:
        with zipfile.ZipFile(io.BytesIO(xlsx_bytes)) as z:
            with z.open('xl/sharedStrings.xml') as f:
                ss_raw = f.read()
            ns_match = re.search(rb'xmlns=["\']([^"\']+)["\']', ss_raw)
            ns_uri = ns_match.group(1).decode() if ns_match else \
                'http://schemas.openxmlformats.org/spreadsheetml/2006/main'

            ss_tree = ET.fromstring(ss_raw)
            shared = [
                ''.join(t.text or '' for t in si.iter(f'{{{ns_uri}}}t'))
                for si in ss_tree
            ]

            def cell_value(c):
                t    = c.get('t', '')
                v_el = c.find(f'{{{ns_uri}}}v')
                if v_el is None:
                    return ''
                raw = v_el.text or ''
                if t == 's':
                    try:
                        return shared[int(raw)]
                    except (ValueError, IndexError):
                        return raw
                return raw

            def col_letter_to_idx(ref):
                letters = re.match(r'([A-Z]+)', ref)
                if not letters:
                    return -1
                idx = 0
                for ch in letters.group(1):
                    idx = idx * 26 + (ord(ch) - ord('A') + 1)
                return idx - 1

            # Data is on sheet2
            sheet_file = 'xl/worksheets/sheet2.xml'
            if sheet_file not in z.namelist():
                sheet_file = 'xl/worksheets/sheet1.xml'

            with z.open(sheet_file) as f:
                ws_tree = ET.parse(f)

            rows = ws_tree.getroot().findall(f'.//{{{ns_uri}}}row')

            header_idx = None
            col_idx = {}

            for i, row in enumerate(rows):
                cells  = row.findall(f'{{{ns_uri}}}c')
                values = [cell_value(c) for c in cells]
                if any(v.lower() == 'country/territory' for v in values):
                    header_idx = i
                    for j, h in enumerate(values):
                        hl = h.lower().strip()
                        if hl == 'country/territory': col_idx['name']    = j
                        elif hl == 'edition':         col_idx['edition'] = j
                        elif hl == 'status':          col_idx['status']  = j
                        elif hl == 'total':           col_idx['total']   = j
                        elif hl == 'pr rating':       col_idx['pr']      = j
                        elif hl == 'cl rating':       col_idx['cl']      = j
                    break

            if header_idx is None or 'name' not in col_idx:
                return None

            best_row     = None
            best_edition = 0

            for row in rows[header_idx + 1:]:
                cells   = row.findall(f'{{{ns_uri}}}c')
                col_map = {col_letter_to_idx(c.get('r', '')): cell_value(c) for c in cells}

                name_val = col_map.get(col_idx['name'], '').strip()
                if name_val.lower() != fh_name.lower():
                    continue

                try:
                    edition_int = int(float(col_map.get(col_idx.get('edition', -1), '') or 0))
                except (ValueError, TypeError):
                    edition_int = 0

                if edition_int > best_edition:
                    best_edition = edition_int
                    best_row     = col_map

            if best_row is None:
                return None

            try:
                total = int(float(best_row.get(col_idx.get('total', -1), '') or ''))
            except (ValueError, TypeError):
                return None

            result = {
                'status':       1,
                'value':        total,
                'year':         str(best_edition),
                'source':       'Freedom House Freedom in the World',
                'label':        'Freedom House FIW (higher = more free)',
                'status_label': best_row.get(col_idx.get('status', -1), '').strip() or None,
                'url':          'https://freedomhouse.org/report/freedom-world',
            }
            try:
                result['pr_rating'] = int(float(best_row.get(col_idx.get('pr', -1), '') or ''))
                result['cl_rating'] = int(float(best_row.get(col_idx.get('cl', -1), '') or ''))
            except (ValueError, TypeError):
                pass
            return result

    except Exception as e:
        print(f'  ⚠  Freedom House xlsx parse error: {e}')
        return None


def fetch_freedom_house_xlsx(iso3, country_name, year=None):
    """
    Download FH All Data xlsx and extract score/status for the country.
    Tries current pub year then prior year automatically.
    Returns a result dict or None.
    """
    if year is None:
        year = _cfg('freedom_house', 'year', default=datetime.now().year)

    fh_name  = _FH_NAME_OVERRIDES.get(iso3.upper(), country_name)
    fh_tpl   = _cfg('freedom_house', 'url',
                    default='https://freedomhouse.org/sites/default/files/{year}-02/All_data_FIW_2013-{year_minus_1}.xlsx')

    for try_year in (year, year - 1):
        url = fh_tpl.format(year=try_year, year_minus_1=try_year - 1)
        try:
            r = SESSION.get(url, headers=_TI_HEADERS, timeout=60, allow_redirects=True)
            if r.status_code == 404:
                continue
            r.raise_for_status()
        except Exception as e:
            print(f'  ⚠  Freedom House xlsx download failed ({try_year}): {e}')
            continue

        result = _parse_xlsx_for_fh(r.content, fh_name)
        if result:
            return result
        print(f'  ⚠  Freedom House: "{fh_name}" not found in {try_year} xlsx')

    print(f'  ⚠  Freedom House: no data found for "{country_name}" (fh_name: {fh_name})')
    return None


def fetch_indexes(iso3, ti_cpi_live=None, fh_live=None):
    """
    Returns index scores for iso3.
    ti_cpi_live: result from fetch_ti_cpi_live() — used instead of CSV if provided.
    fh_live:     result from fetch_freedom_house_live() — used instead of CSV if provided.
    CSV supplies GPI, RSF, WJP (and TI CPI / FH fallback).
    """
    results = {}

    # TI CPI: live fetch takes priority; CSV is fallback
    if ti_cpi_live is not None:
        results['ti_cpi'] = ti_cpi_live

    # Freedom House: live fetch takes priority; CSV is fallback
    if fh_live is not None:
        results['fh'] = fh_live

    path = os.path.normpath(_INDEXES_CSV)
    if not os.path.exists(path):
        print(f'  ⚠  indexes.csv not found at {path}')
        return results

    with open(path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(
            (line for line in f if not line.startswith('#') and line.strip()),
        )
        for row in reader:
            if row.get('iso3', '').strip().upper() != iso3.upper():
                continue
            for key, (label, url, lo, hi, note) in _INDEX_META.items():
                if key in results:
                    continue  # already have live data for this index
                score_col = f'{key}_score'
                rank_col  = f'{key}_rank'
                year_col  = f'{key}_year'
                score = row.get(score_col, '').strip()
                rank  = row.get(rank_col,  '').strip()
                year  = row.get(year_col,  '').strip()
                if not score:
                    continue
                entry = {
                    'status': 1,
                    'value':  float(score),
                    'year':   year,
                    'source': label,
                    'label':  f'{label} ({note})',
                    'url':    url,
                }
                if rank:
                    entry['rank'] = int(rank)
                if key == 'fh':
                    status_val = row.get('fh_status', '').strip()
                    if status_val:
                        entry['status_label'] = status_val
                results[key] = entry
            break

    return results


# ──────────────────────────────────────────────────────────────────────────────
# FETCH: WORLD BANK WGI (Worldwide Governance Indicators)
#
# Protocol : HTTPS REST — same WB API as fetch_worldbank() but with ?source=3
# Auth     : none
# Request  : GET https://api.worldbank.org/v2/country/{iso2}/indicator/{code}
#              ?source=3&format=json&mrv=5&per_page=5
#            source=3 selects the WGI database (not available in default source=2).
#            Covers: Rule of Law, Government Effectiveness, Control of Corruption,
#            Voice & Accountability, Political Stability, Regulatory Quality.
# Response : Same JSON structure as fetch_worldbank() — [metadata, [datapoints]]
#            Values range from approx -2.5 (worst) to +2.5 (best).
# Note     : WGI updated annually (Sep/Oct). Same URL used by xmarquez/democracyData
#            download_wgi_voice_and_accountability() but via API not xlsx.
# ──────────────────────────────────────────────────────────────────────────────
def fetch_wgi(iso2):
    indicators = {
        'GOV_WGI_RL.EST': ('rule_of_law_estimate',          'Rule of Law estimate (-2.5 to +2.5)'),
        'GOV_WGI_GE.EST': ('govt_effectiveness_estimate',   'Government Effectiveness estimate'),
        'GOV_WGI_CC.EST': ('control_corruption_estimate',   'Control of Corruption estimate'),
        'GOV_WGI_VA.EST': ('voice_accountability_estimate', 'Voice and Accountability estimate'),
        'GOV_WGI_PV.EST': ('political_stability_estimate',  'Political Stability & Absence of Violence estimate'),
        'GOV_WGI_RQ.EST': ('regulatory_quality_estimate',   'Regulatory Quality estimate'),
    }
    results = {}
    for code, (field, label) in indicators.items():
        url = (
            f'https://api.worldbank.org/v2/country/{iso2}/indicator/{code}'
            f'?source=3&format=json&mrv=5&per_page=5'
        )
        try:
            r = SESSION.get(url, timeout=15)
            r.raise_for_status()
            body = r.json()
            if len(body) < 2 or not body[1]:
                continue
            for entry in body[1]:
                if entry.get('value') is not None:
                    results[field] = {
                        'status':    1,
                        'value':     round(entry['value'], 4),
                        'year':      entry['date'],
                        'source':    'World Bank WGI',
                        'label':     label,
                        'indicator': code,
                        'url':       'https://info.worldbank.org/governance/wgi/',
                    }
                    break
        except Exception:
            pass
        time.sleep(0.12)
    return results


# ──────────────────────────────────────────────────────────────────────────────
# FETCH: WHO GHO
#
# Protocol : HTTPS REST (OData v4)
# Auth     : none
# Request  : GET https://ghoapi.azureedge.net/api/{indicator_code}
#              ?$filter=SpatialDim eq '{iso3}' and Dim1 eq 'BTSX'
#              &$orderby=TimeDim desc&$top=1
#            BTSX = both sexes combined. If that returns empty, retries without
#            the sex dimension (some indicators don't stratify by sex).
# Response : OData JSON { "value": [ { "NumericValue", "TimeDim", ... } ] }
#            TimeDim is the year. NumericValue preferred over Value (string).
# Note     : GHO is the WHO's open data platform. No rate limit documented.
#            Data lag varies by indicator (1–3 years behind current year).
# ──────────────────────────────────────────────────────────────────────────────
def fetch_who_gho(iso3):
    indicators = {
        'BP_04': ('hypertension_prevalence_pct', 'Hypertension prevalence % (raised BP)'),
        'NCD_BMI_30C': ('obesity_prevalence_pct_who', 'Obesity prevalence % (BMI≥30)'),
        'MDG_0000000029': ('tobacco_use_pct', 'Tobacco use % adults'),
        'NCDMORT3070': ('ncd_mortality_risk_pct', 'NCD 30-70 premature mortality risk %'),
        'NCD_GLUC_04': ('diabetes_prevalence_pct', 'Diabetes prevalence %'),
        'MH_12': ('suicide_rate_per100k', 'Suicide rate per 100k'),
    }
    results = {}
    base = 'https://ghoapi.azureedge.net/api'
    for code, (field, label) in indicators.items():
        url = f'{base}/{code}?$filter=SpatialDim eq \'{iso3}\' and Dim1 eq \'BTSX\'&$orderby=TimeDim desc&$top=1'
        try:
            r = SESSION.get(url, timeout=20)
            r.raise_for_status()
            rows = r.json().get('value', [])
            if not rows:
                # retry without sex dimension
                url2 = f'{base}/{code}?$filter=SpatialDim eq \'{iso3}\'&$orderby=TimeDim desc&$top=1'
                r2 = SESSION.get(url2, timeout=20)
                r2.raise_for_status()
                rows = r2.json().get('value', [])
            if rows:
                row = rows[0]
                val = row.get('NumericValue') or row.get('Value')
                if val is not None:
                    results[field] = {
                        'status': 1,
                        'value':  val,
                        'year':   str(row.get('TimeDim', '')),
                        'source': 'WHO Global Health Observatory',
                        'label':  label,
                        'url':    f'https://www.who.int/data/gho/data/indicators/indicator-details/GHO/{code}',
                    }
        except Exception as e:
            pass
        time.sleep(0.2)
    return results


# ──────────────────────────────────────────────────────────────────────────────
# FETCH: WIKIDATA (SPARQL)
#
# Protocol : HTTPS SPARQL 1.1 — graph query language over a triple store
# Auth     : none (User-Agent required per Wikidata policy)
# Endpoint : https://query.wikidata.org/sparql
# Request  : GET with ?query={SPARQL}&format=json
#            Three separate queries (1s sleep between each to respect rate limit):
#              Q1 — country facts: P297=ISO2 → highest point (P610+P2044),
#                   lowest point (P1589+P2044), head of state (P35),
#                   government form (P122), inception/independence date (P571)
#              Q2 — cities: cities in country (P17) classified as city (Q515),
#                   ordered by population (P1082) desc, top 10
#              Q3 — UNESCO sites: count of items classified as WHS (Q9259)
#                   with P17 = this country
# Response : SPARQL JSON { "results": { "bindings": [ { var: { value } } ] } }
#            Labels auto-resolved via SERVICE wikibase:label in English.
# Note     : Wikidata data quality varies. Head of state may lag elections by
#            weeks. City populations use whatever the most recent edit states.
# ──────────────────────────────────────────────────────────────────────────────
def fetch_wikidata(iso2):
    endpoint = 'https://query.wikidata.org/sparql'
    headers  = {
        'User-Agent': 'DashboardDataFetcher/1.0 (educational use)',
        'Accept':     'application/json',
    }
    results = {}

    # ── Country facts: highest/lowest point, head of state, govt form, independence date ──
    sparql_country = f"""
SELECT ?highestPoint ?highestPointLabel ?highestElev
       ?lowestPoint ?lowestPointLabel ?lowestElev
       ?headOfState ?headOfStateLabel
       ?govtFormLabel ?independenceDate
WHERE {{
  ?country wdt:P297 "{iso2}" .
  OPTIONAL {{ ?country wdt:P610 ?highestPoint .
              ?highestPoint wdt:P2044 ?highestElev . }}
  OPTIONAL {{ ?country wdt:P1589 ?lowestPoint .
              ?lowestPoint wdt:P2044 ?lowestElev . }}
  OPTIONAL {{ ?country wdt:P35 ?headOfState . }}
  OPTIONAL {{ ?country wdt:P122 ?govtForm . }}
  OPTIONAL {{ ?country wdt:P571 ?independenceDate . }}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
}}
LIMIT 1
"""
    try:
        r = SESSION.get(endpoint, params={'query': sparql_country, 'format': 'json'},
                        headers=headers, timeout=30)
        r.raise_for_status()
        bindings = r.json().get('results', {}).get('bindings', [])
        if bindings:
            b = bindings[0]
            if 'highestPointLabel' in b:
                results['highest_point_name'] = {
                    'status': 1, 'value': b['highestPointLabel']['value'],
                    'source': 'Wikidata', 'label': 'Highest point name',
                    'url': 'https://www.wikidata.org/',
                }
            if 'highestElev' in b:
                results['highest_point_elev_m'] = {
                    'status': 1, 'value': float(b['highestElev']['value']),
                    'source': 'Wikidata', 'label': 'Highest point elevation (m)',
                    'url': 'https://www.wikidata.org/',
                }
            if 'lowestPointLabel' in b:
                results['lowest_point_name'] = {
                    'status': 1, 'value': b['lowestPointLabel']['value'],
                    'source': 'Wikidata', 'label': 'Lowest point name',
                    'url': 'https://www.wikidata.org/',
                }
            if 'lowestElev' in b:
                results['lowest_point_elev_m'] = {
                    'status': 1, 'value': float(b['lowestElev']['value']),
                    'source': 'Wikidata', 'label': 'Lowest point elevation (m)',
                    'url': 'https://www.wikidata.org/',
                }
            if 'headOfStateLabel' in b:
                results['head_of_state'] = {
                    'status': 1, 'value': b['headOfStateLabel']['value'],
                    'source': 'Wikidata', 'label': 'Head of state',
                    'url': 'https://www.wikidata.org/',
                }
            if 'govtFormLabel' in b:
                results['government_form'] = {
                    'status': 1, 'value': b['govtFormLabel']['value'],
                    'source': 'Wikidata', 'label': 'Government form',
                    'url': 'https://www.wikidata.org/',
                }
            if 'independenceDate' in b:
                results['independence_date'] = {
                    'status': 1, 'value': b['independenceDate']['value'][:10],
                    'source': 'Wikidata', 'label': 'Independence date',
                    'url': 'https://www.wikidata.org/',
                }
    except Exception as e:
        print(f'  ⚠  Wikidata (country facts): {e}')
    time.sleep(1)

    # ── City populations ──
    sparql_cities = f"""
SELECT ?cityLabel ?population ?coord
WHERE {{
  ?country wdt:P297 "{iso2}" .
  ?city wdt:P17 ?country ;
        wdt:P31/wdt:P279* wd:Q515 ;
        wdt:P1082 ?population .
  OPTIONAL {{ ?city wdt:P625 ?coord . }}
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en" . }}
}}
ORDER BY DESC(?population)
LIMIT 10
"""
    try:
        r = SESSION.get(endpoint, params={'query': sparql_cities, 'format': 'json'},
                        headers=headers, timeout=30)
        r.raise_for_status()
        bindings = r.json().get('results', {}).get('bindings', [])
        cities = []
        for b in bindings:
            cities.append({
                'name':       b.get('cityLabel', {}).get('value', ''),
                'population': int(b['population']['value']) if 'population' in b else None,
            })
        if cities:
            results['cities_by_population'] = {
                'status': 1, 'value': cities,
                'source': 'Wikidata', 'label': 'Cities by population (top 10)',
                'url': 'https://www.wikidata.org/',
            }
    except Exception as e:
        print(f'  ⚠  Wikidata (cities): {e}')
    time.sleep(1)

    # ── UNESCO World Heritage Site count ──
    sparql_unesco = f"""
SELECT (COUNT(?site) AS ?count)
WHERE {{
  ?country wdt:P297 "{iso2}" .
  ?site wdt:P31/wdt:P279* wd:Q9259 ;
        wdt:P17 ?country .
}}
"""
    try:
        r = SESSION.get(endpoint, params={'query': sparql_unesco, 'format': 'json'},
                        headers=headers, timeout=30)
        r.raise_for_status()
        bindings = r.json().get('results', {}).get('bindings', [])
        if bindings:
            count = int(bindings[0].get('count', {}).get('value', 0))
            results['unesco_sites_count'] = {
                'status': 1, 'value': count,
                'source': 'Wikidata', 'label': 'UNESCO World Heritage Sites count',
                'url': 'https://www.wikidata.org/',
            }
    except Exception as e:
        print(f'  ⚠  Wikidata (UNESCO): {e}')

    return results


# ──────────────────────────────────────────────────────────────────────────────
# FETCH: ILO ILOSTAT — sector wages
#
# Protocol : HTTPS REST
# Auth     : none
# Request  : GET https://rplumber.ilo.org/data/indicator/
#              ?id=EAR_4MTH_SEX_ECO_CUR_NB_A
#              &ref_area={iso2}&classif1=ECO_ISIC4_{sector}
#              &sex=SEX_T&time=2018:2024&format=json&lang=en
#            EAR_4MTH_SEX_ECO_CUR_NB_A = mean nominal monthly earnings
#            by sex and economic activity in local currency units (LCU).
#            Sector codes follow ISIC Rev.4: A=Agriculture, B=Mining,
#            F=Construction, K=Finance, O=Public admin, P=Education.
# Response : JSON { "data": [ { "obs_value", "time", "classif2", ... } ] }
#            classif2 contains the currency code. Script picks most recent year.
# Note     : Coverage is patchy — many countries don't report sector-level wages
#            to ILO. Missing sectors return no data (not an error).
# ──────────────────────────────────────────────────────────────────────────────
def fetch_ilo_wages(iso2):
    # ILOSTAT API — mean nominal monthly wages by sector (ISIC Rev.4)
    # Sector codes (ISIC Rev.4): K=Finance, B=Mining, A=Agriculture,
    #   P=Education, O=Public admin, F=Construction
    sectors = {
        'K': 'finance',
        'B': 'mining',
        'A': 'agriculture',
        'P': 'education',
        'O': 'public_admin',
        'F': 'construction',
    }
    results    = {}
    base       = _cfg('ilo', 'base_url',    default='https://rplumber.ilo.org/data/indicator/')
    time_range = _cfg('ilo', 'time_range',  default='2018:2024')
    for isic, name in sectors.items():
        url = (
            f'{base}?id=EAR_4MTH_SEX_ECO_CUR_NB_A'
            f'&ref_area={iso2}&classif1=ECO_ISIC4_{isic}'
            f'&sex=SEX_T&time={time_range}&format=json&lang=en'
        )
        try:
            r = SESSION.get(url, timeout=20)
            r.raise_for_status()
            rows = r.json().get('data', [])
            # pick most recent non-null
            rows_sorted = sorted(
                [row for row in rows if row.get('obs_value') is not None],
                key=lambda x: x.get('time', ''), reverse=True
            )
            if rows_sorted:
                row = rows_sorted[0]
                results[f'wage_{name}_monthly_lcu'] = {
                    'status':   1,
                    'value':    row['obs_value'],
                    'year':     row.get('time', ''),
                    'currency': row.get('classif2', 'LCU'),
                    'source':   'ILO ILOSTAT',
                    'label':    f'Mean monthly wage — {name} sector (local currency)',
                    'url':      'https://ilostat.ilo.org/data/',
                }
        except Exception as e:
            pass
        time.sleep(0.3)
    return results


# ──────────────────────────────────────────────────────────────────────────────
# FETCH: FRANKFURTER — exchange rate (USD → local currency)
#
# Protocol : HTTPS REST
# Auth     : none
# Request  : GET https://api.frankfurter.app/latest?from=USD&to={currency_code}
#            currency_code is resolved from the REST Countries response (meta.currency_code).
# Response : JSON { "date": "2024-06-14", "rates": { "{code}": 1.08 } }
#            Always returns the latest ECB reference rate for the day.
# Note     : Frankfurter proxies the European Central Bank's reference rates.
#            Only covers ~33 currencies (major + EUR basket). Exotic currencies
#            (UZS, TJS, TMT, KGS, KZT) are NOT in the ECB basket — those will
#            silently return no data. For Central Asian currencies, use a
#            dedicated forex API or enter rates manually.
# ──────────────────────────────────────────────────────────────────────────────
def fetch_exchange_rate(currency_code):
    if not currency_code or currency_code == 'USD':
        return None
    fk_base = _cfg('frankfurter', 'base_url', default='https://api.frankfurter.app/latest')
    url = f'{fk_base}?from=USD&to={currency_code}'
    try:
        r = SESSION.get(url, timeout=10)
        r.raise_for_status()
        body = r.json()
        rate = body.get('rates', {}).get(currency_code)
        if rate is not None:
            return {
                'status':        1,
                'value':         rate,
                'base':          'USD',
                'target':        currency_code,
                'date':          body.get('date', ''),
                'source':        'Frankfurter (ECB reference rates)',
                'label':         f'1 USD = {rate} {currency_code}',
                'url':           'https://www.frankfurter.app/',
            }
    except Exception as e:
        print(f'  ⚠  Exchange rate ({currency_code}): {e}')
    return None


# ──────────────────────────────────────────────────────────────────────────────
# COMPUTE: DAYLIGHT HOURS (pure math, no network)
#
# Protocol : none — purely local computation
# Input    : capital city latitude (from REST Countries / Nominatim)
# Method   : Spencer (1971) solar declination formula + hour-angle equation
#              B      = (360/365) × (doy − 81)          [degrees]
#              decl   = 23.45 × sin(B)                  [degrees]
#              cos_ha = −tan(lat) × tan(decl)
#              daylight = 2 × arccos(cos_ha) / 15       [hours]
#            Computed for the 21st of each month (representative mid-month day).
#            Clamped to [−1, 1] before arccos for polar-region safety.
# Output   : 12-month dict { "Jan": 9.2, "Feb": 10.1, ... }
# Accuracy : ±10–15 min vs. actual sunrise/sunset (ignores atmospheric
#            refraction and equation of time). Sufficient for dashboard display.
# ──────────────────────────────────────────────────────────────────────────────
def compute_daylight(lat):
    import math
    MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    # Day-of-year for the 21st of each month (non-leap year)
    doy_21 = [21, 52, 80, 111, 141, 172, 202, 233, 264, 294, 325, 355]
    results = {}
    lat_r = math.radians(lat)
    for i, doy in enumerate(doy_21):
        # Solar declination (Spencer formula, degrees)
        B = math.radians((360 / 365) * (doy - 81))
        decl = math.radians(23.45 * math.sin(B))
        # Hour angle at sunrise
        cos_ha = -math.tan(lat_r) * math.tan(decl)
        cos_ha = max(-1.0, min(1.0, cos_ha))  # clamp for polar regions
        ha = math.degrees(math.acos(cos_ha))
        daylight_h = round(2 * ha / 15, 1)
        results[MONTHS[i]] = daylight_h
    return {
        'status':   1,
        'latitude': lat,
        'source':   'Computed (astronomical sunrise equation, 21st of each month)',
        'label':    'Daylight hours by month',
        'monthly':  results,
    }


# ──────────────────────────────────────────────────────────────────────────────
# FETCH: OPEN-METEO CLIMATE ARCHIVE
#
# Protocol : HTTPS REST
# Auth     : none (free tier; no key required)
# Request  : GET https://archive-api.open-meteo.com/v1/archive
#              ?latitude={lat}&longitude={lon}
#              &start_date=1991-01-01&end_date=2020-12-31
#              &daily=temperature_2m_mean,temperature_2m_max,
#                     temperature_2m_min,precipitation_sum
#              &timezone=auto
#            Returns daily ERA5 reanalysis data for 30 years (~10 950 rows).
# Response : JSON { "daily": { "time": [...], "temperature_2m_mean": [...], ... } }
#            All arrays are parallel (index i = day i).
# Processing: Script buckets daily values by calendar month and computes:
#              - monthly mean/max/min temperature and total precipitation
#              - annual averages, warmest/coldest/wettest/driest month
#            Produces WMO-standard 1991–2020 climate normals.
# Note     : Capital city coordinates only — does not fetch regional cities.
#            Response is large (~2 MB JSON); timeout set to 90s.
# ──────────────────────────────────────────────────────────────────────────────
def fetch_climate(lat, lon, capital_name):
    MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    url = (
        f'https://archive-api.open-meteo.com/v1/archive'
        f'?latitude={lat}&longitude={lon}'
        f'&start_date=1991-01-01&end_date=2020-12-31'
        f'&daily=temperature_2m_mean,temperature_2m_max,temperature_2m_min,precipitation_sum'
        f'&timezone=auto'
    )
    try:
        r = SESSION.get(url, timeout=90)
        r.raise_for_status()
        daily = r.json().get('daily', {})
        dates      = daily.get('time', [])
        t_mean     = daily.get('temperature_2m_mean', [])
        t_max      = daily.get('temperature_2m_max', [])
        t_min      = daily.get('temperature_2m_min', [])
        precip     = daily.get('precipitation_sum', [])

        # Bucket by calendar month
        buckets = {m: {'t_mean': [], 't_max': [], 't_min': [], 'precip': []}
                   for m in range(1, 13)}
        for i, d in enumerate(dates):
            m = int(d[5:7])
            if t_mean[i]  is not None: buckets[m]['t_mean'].append(t_mean[i])
            if t_max[i]   is not None: buckets[m]['t_max'].append(t_max[i])
            if t_min[i]   is not None: buckets[m]['t_min'].append(t_min[i])
            if precip[i]  is not None: buckets[m]['precip'].append(precip[i])

        def avg(lst): return round(sum(lst) / len(lst), 1) if lst else None
        def tot(lst): return round(sum(lst), 1) if lst else None

        monthly = {}
        for m in range(1, 13):
            b = buckets[m]
            monthly[MONTHS[m-1]] = {
                'temp_mean_c':  avg(b['t_mean']),
                'temp_max_c':   avg(b['t_max']),
                'temp_min_c':   avg(b['t_min']),
                'precip_mm':    tot(b['precip']),
            }

        all_temps  = [v for m in range(1,13) for v in buckets[m]['t_mean']]
        all_precip = [v for m in range(1,13) for v in buckets[m]['precip']]
        annual_temp   = avg(all_temps)
        annual_precip = round(sum(all_precip) / 30) if all_precip else None  # avg annual

        warmest = max(range(1,13), key=lambda m: avg(buckets[m]['t_mean']) or -99)
        coldest = min(range(1,13), key=lambda m: avg(buckets[m]['t_mean']) or  99)
        wettest = max(range(1,13), key=lambda m: tot(buckets[m]['precip']) or   0)
        driest  = min(range(1,13), key=lambda m: tot(buckets[m]['precip']) or 999)

        return {
            'status':            1,
            'location':          capital_name,
            'latitude':          lat,
            'longitude':         lon,
            'period':            '1991-2020 climate normals',
            'source':            'Open-Meteo Archive API',
            'url':               'https://archive-api.open-meteo.com/',
            'annual_avg_temp_c': annual_temp,
            'annual_precip_mm':  annual_precip,
            'warmest_month':     MONTHS[warmest-1],
            'coldest_month':     MONTHS[coldest-1],
            'wettest_month':     MONTHS[wettest-1],
            'driest_month':      MONTHS[driest-1],
            'monthly':           monthly,
        }
    except Exception as e:
        print(f'  ⚠  Climate: {e}')
        return None

# ──────────────────────────────────────────────────────────────────────────────
# JSX-READY FORMATTER — produces pre-formatted display strings for prefill_dashboard.py
# All formatting logic lives here so prefill_dashboard.py can stay simple.
# ──────────────────────────────────────────────────────────────────────────────

def _jfmt(raw, fmt):
    """Format a raw value into a JSX display string. Returns None if raw is None/empty."""
    if raw is None or raw == 'No data':
        return None
    try:
        v = float(raw)
    except (TypeError, ValueError):
        v = None

    if fmt == 'usd_B':
        b = v / 1e9
        if b >= 100: return f'~${b:.0f}B'
        if b >= 10:  return f'~${b:.1f}B'
        return f'~${b:.2f}B'

    if fmt == 'usd_M':
        m = v / 1e6
        if m >= 1000: return f'~${m/1000:.1f}B'
        if m >= 100:  return f'~${m:.0f}M'
        return f'~${m:.1f}M'

    if fmt == 'usd_comma':
        return f'~${round(v / 100) * 100:,.0f}'

    if fmt == 'pct1':
        return f'{v:.1f}%'

    if fmt == 'pct1s':
        return f'{"+" if v >= 0 else ""}{v:.1f}%'

    if fmt == 'pct0':
        return f'{v:.0f}%'

    if fmt == 'pop':
        if v >= 1e6:  return f'~{v/1e6:.1f}M'
        if v >= 1e3:  return f'~{v/1e3:.0f}K'
        return f'{int(v)}'

    if fmt == 'pop_exact':
        return f'{int(v):,}'

    if fmt == 'int':
        return f'{int(v):,}'

    if fmt == 'int_sign':
        return f'{"+" if v >= 0 else ""}{int(v):,}'

    if fmt == 'km2':
        return f'{int(v):,} km²'

    if fmt == 'density':
        return f'{v:.1f} /km²'

    if fmt == 'yrs':
        return f'{v:.1f} yrs'

    if fmt == 'f1':
        return f'{v:.1f}'

    if fmt == 'f2':
        return f'{v:.2f}'

    if fmt == 'f3':
        return f'{v:.3f}'

    if fmt == 'temp':
        return f'{v:.1f}°C'

    if fmt == 'mm':
        return f'{int(round(v))} mm'

    if fmt == 'per1k':
        return f'{v:.1f} per 1k'

    if fmt == 'per100k':
        return f'{int(round(v))} per 100k'

    if fmt == 'per100k2':
        return f'{v:.2f} per 100k'

    if fmt == 'per100':
        return f'{v:.1f} per 100'

    if fmt == 'ugm3':
        return f'{v:.1f} μg/m³'

    if fmt == 'm3':
        return f'{int(v):,} m³/cap'

    if fmt == 'kgoe':
        return f'{int(v):,} kgoe/cap'

    if fmt == 'kwh':
        return f'{int(v):,} kWh/cap'

    if fmt == 'wgi':
        return f'{v:.4f}'

    if fmt == 'cpi':
        return f'{int(v)}/100'

    if fmt == 'fh':
        return f'{int(v)}/100'

    if fmt == 'gpi_tile':
        return f'GPI {v:.3f}'

    if fmt == 'gpi':
        return f'{v:.3f}'

    if fmt == 'cap':
        return str(raw).capitalize()

    if fmt == 'date':
        try:
            from datetime import datetime as _dt
            return _dt.strptime(str(raw), '%Y-%m-%d').strftime('%b %d, %Y')
        except Exception:
            return str(raw)

    if fmt == 'raw':
        return str(raw)

    return str(raw)


def _jget(output, path):
    """Resolve a dot-path into a leaf node dict from the output."""
    parts = path.split('.')
    node  = output
    for p in parts:
        if not isinstance(node, dict) or p not in node:
            return None
        node = node[p]
    return node


def _jval(output, path):
    """Return scalar value at dot-path, or None."""
    node = _jget(output, path)
    if node is None:
        return None
    if isinstance(node, dict):
        v = node.get('value')
        return None if v in (None, 'No data') else v
    return node


def _jyear(output, path):
    """Return year string at dot-path, or ''."""
    node = _jget(output, path)
    if isinstance(node, dict):
        return str(node.get('year', '')) if node.get('year') else ''
    return ''


def _item(output, path, fmt, label_hint, sub_tpl, manual=None):
    """Build a single jsx_ready item dict."""
    raw  = _jval(output, path)
    year = _jyear(output, path)
    fv   = _jfmt(raw, fmt) if raw is not None else None
    sub  = sub_tpl.replace('{year}', year) if sub_tpl and year else sub_tpl or ''
    return {
        'label_hint': label_hint,
        'value':      fv,
        'sub':        sub if fv else None,
        'year':       year,
        'ready':      fv is not None,
        'manual':     manual,
    }


def _daylight_str(h):
    hrs  = int(h)
    mins = round((h - hrs) * 60)
    if mins == 60:
        hrs += 1; mins = 0
    return f'{hrs}h {mins:02d}m'


def _none(label_hint, manual='Manual entry required'):
    """Placeholder slot — no API source for this field."""
    return {'label_hint': label_hint, 'value': None, 'sub': manual,
            'year': '', 'ready': False, 'manual': manual}


def build_jsx_ready(output):
    """
    Build the jsx_ready section from fetched data.
    Returns {'by_id': {N: {value, sub, state}}} keyed by the global id:N
    assigned to every item in the JSX template.

    prefill_dashboard.py finds each `id:N` line and patches value/sub/state.
    Use _none() for slots with no API source — they get value:'', state:0.
    """
    W = 'world_bank'

    def item(id_n, path, fmt, sub_tmpl):
        """Fetch a value and return a by_id entry."""
        val = _jval(output, path)
        yr  = _jyear(output, path)
        fv  = _jfmt(val, fmt) if val is not None else None
        sub = sub_tmpl.replace('{year}', str(yr)) if fv else None
        return id_n, {'value': fv or '', 'sub': sub or 'Manual entry required', 'state': 1 if fv else 0}

    def none(id_n, sub='Manual entry required'):
        """Placeholder — no API source."""
        return id_n, {'value': '', 'sub': sub, 'state': 0}

    # Pre-fetch shared values
    gpi_raw  = _jval(output, 'indexes.gpi');  gpi_year = _jyear(output, 'indexes.gpi')
    ti_raw   = _jval(output, 'indexes.ti_cpi'); ti_yr  = _jyear(output, 'indexes.ti_cpi')
    fh_raw   = _jval(output, 'indexes.fh');   fh_yr   = _jyear(output, 'indexes.fh')
    rsf_raw  = _jval(output, 'indexes.rsf');  rsf_yr  = _jyear(output, 'indexes.rsf')
    wjp_raw  = _jval(output, 'indexes.wjp');  wjp_yr  = _jyear(output, 'indexes.wjp')
    govt_raw = _jval(output, 'wikidata.government_form')
    ind_raw  = _jval(output, 'wikidata.independence_date')
    hos_raw  = _jval(output, 'wikidata.head_of_state')
    hp_name  = _jval(output, 'wikidata.highest_point_name')
    hp_elev  = _jval(output, 'wikidata.highest_point_elev_m')
    lp_name  = _jval(output, 'wikidata.lowest_point_name')
    lp_elev  = _jval(output, 'wikidata.lowest_point_elev_m')
    tot      = _jval(output, f'{W}.population_total')
    fe       = _jval(output, f'{W}.life_expectancy_female')
    ma       = _jval(output, f'{W}.life_expectancy_male')
    tot_e    = _jval(output, f'{W}.life_expectancy_total')
    yr_le    = _jyear(output, f'{W}.life_expectancy_total')
    life_exp = (f'{float(tot_e):.1f} yrs (♀ {float(fe):.1f} · ♂ {float(ma):.1f})'
                if tot_e and fe and ma else _jfmt(tot_e, 'yrs'))
    rem_usd  = _jval(output, f'{W}.remittances_usd')
    rem_pct  = _jval(output, f'{W}.remittances_pct_gdp')
    rem_yr   = _jyear(output, f'{W}.remittances_usd')
    rem_val  = (f'{float(rem_usd)/1e9:.2f}B ({float(rem_pct):.1f}% of GDP)'
                if rem_usd and rem_pct else None)

    # Climate
    climate    = output.get('climate') or {}
    monthly_cl = climate.get('monthly', {})
    months_ord = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    def _mavg(months):
        v = [monthly_cl.get(m, {}).get('temp_mean_c') for m in months if monthly_cl.get(m, {}).get('temp_mean_c') is not None]
        return round(sum(v)/len(v), 1) if v else None
    summer_avg = _mavg(['Jun','Jul','Aug'])
    winter_avg = _mavg(['Dec','Jan','Feb'])
    spring_avg = _mavg(['Mar','Apr','May'])

    by_id = dict([
        # ── TILES (ids 1–16) ────────────────────────────────────────────────
        item(1,  f'{W}.gdp_usd',              'usd_B',    'World Bank {year}'),
        item(2,  f'{W}.gdp_per_capita_usd',   'usd_comma','World Bank {year}'),
        item(3,  f'{W}.gdp_growth_pct',       'pct1s',    'World Bank {year}'),
        item(4,  f'{W}.population_total',     'pop_M',    'World Bank {year}'),
        none(5,  'ISO 4217 code + exchange rate — manual'),
        item(6,  f'{W}.inflation_cpi_pct',    'pct1',     'World Bank CPI {year}'),
        item(7,  f'{W}.unemployment_pct',     'pct1',     'ILO modelled {year}'),
        item(8,  f'{W}.literacy_rate_adult_pct','pct1',   'World Bank {year}'),
        none(9,  'Religion breakdown — manual'),
        none(10, 'Official language — manual'),
        (11, {'value': life_exp or '',           'sub': f'World Bank {yr_le}' if life_exp else 'Manual entry required', 'state': 1 if life_exp else 0}),
        none(12, 'HDI rank — check UNDP HDR'),
        (13, {'value': str(govt_raw) if govt_raw else '', 'sub': 'Wikidata' if govt_raw else 'Manual entry required', 'state': 1 if govt_raw else 0}),
        none(14, 'Natural resources — manual'),
        (15, {'value': _jfmt(gpi_raw, 'gpi') if gpi_raw else '', 'sub': f'IEP GPI {gpi_year}' if gpi_raw else 'Manual entry required', 'state': 1 if gpi_raw else 0}),
        item(16, f'{W}.area_km2',             'km2',      'World Bank'),

        # ── GEO (ids 17–25) ─────────────────────────────────────────────────
        item(17, f'{W}.area_km2',             'km2',      'World Bank'),
        (18, {'value': f'{hp_name} — {int(float(hp_elev))} m' if hp_name and hp_elev else '', 'sub': 'Wikidata' if hp_name else 'Manual entry required', 'state': 1 if (hp_name and hp_elev) else 0}),
        (19, {'value': f'{lp_name} ({int(float(lp_elev))} m)' if lp_name and lp_elev is not None else '', 'sub': 'Wikidata' if lp_name else 'Manual entry required', 'state': 1 if lp_name else 0}),
        none(20, 'Neighbouring countries — manual'),
        none(21, 'Geographic feature 1 — manual'),
        none(22, 'Geographic feature 2 — manual'),
        none(23, 'Geographic feature 3 — manual'),
        none(24, 'Geographic characteristic — manual'),
        item(25, f'{W}.arable_land_pct',      'pct1',     'World Bank {year}'),

        # ── GEO_TERRAIN (ids 26–30) — manual ────────────────────────────────
        none(26), none(27), none(28), none(29), none(30),

        # ── GEO_WATER (ids 31–36) — manual ──────────────────────────────────
        none(31), none(32), none(33), none(34), none(35), none(36),

        # ── GEO_REGIONS (ids 37–40) — manual ────────────────────────────────
        none(37), none(38), none(39), none(40),

        # ── CLIMA_KPI (ids 41–49) ───────────────────────────────────────────
        (41, {'value': _jfmt(climate.get('annual_avg_temp_c'), 'temp') or '', 'sub': 'Open-Meteo 1991–2020 normals' if climate.get('annual_avg_temp_c') else 'Manual entry required', 'state': 1 if climate.get('annual_avg_temp_c') else 0}),
        none(42, 'Record High temp — national met service / Wikipedia'),
        none(43, 'Record Low temp — national met service / Wikipedia'),
        (44, {'value': _jfmt(climate.get('annual_precip_mm'), 'mm') or '', 'sub': 'Open-Meteo 1991–2020 normals' if climate.get('annual_precip_mm') else 'Manual entry required', 'state': 1 if climate.get('annual_precip_mm') else 0}),
        none(45, 'Köppen climate classification — manual'),
        (46, {'value': _jfmt(summer_avg, 'temp') if summer_avg else '', 'sub': 'Open-Meteo Jun–Aug avg' if summer_avg else 'Manual entry required', 'state': 1 if summer_avg else 0}),
        (47, {'value': _jfmt(winter_avg, 'temp') if winter_avg else '', 'sub': 'Open-Meteo Dec–Feb avg' if winter_avg else 'Manual entry required', 'state': 1 if winter_avg else 0}),
        none(48, 'Second city climate — manual'),
        (49, {'value': _jfmt(spring_avg, 'temp') if spring_avg else '', 'sub': 'Open-Meteo Mar–May avg' if spring_avg else 'Manual entry required', 'state': 1 if spring_avg else 0}),

        # ── CLIMA_DAYLIGHT (ids 50–61) — auto-generated block, skip by_id ───
        # (prefill_dashboard handles CLIMA_DAYLIGHT as a full block replacement)

        # ── CLIMA_RAIN_REGIONAL (ids 62–66) — manual ────────────────────────
        none(62), none(63), none(64), none(65), none(66),

        # ── CLIMA_RAIN_SEASONAL (ids 67–69) — manual ────────────────────────
        none(67), none(68), none(69),

        # ── POP_KPI (ids 70–75) ─────────────────────────────────────────────
        item(70, f'{W}.population_total',          'pop_exact', 'World Bank {year}'),
        item(71, f'{W}.urban_population_pct',      'pct1',      'World Bank {year}'),
        none(72, 'Median Age — check UN WPP (no World Bank API)'),
        item(73, f'{W}.population_density_per_km2','density',   'World Bank {year}'),
        (74, {'value': life_exp or '', 'sub': f'World Bank {yr_le}' if life_exp else 'Manual entry required', 'state': 1 if life_exp else 0}),
        item(75, f'{W}.fertility_rate',            'f2',        'World Bank {year}'),

        # ── POP_GROWTH (ids 76–80) — manual ─────────────────────────────────
        none(76), none(77), none(78), none(79), none(80),

        # ── POP_CITIES (ids 81–85) — auto-generated block, skip ─────────────

        # ── POP_ETHNIC (ids 86–90) — manual ─────────────────────────────────
        none(86), none(87), none(88), none(89), none(90),

        # ── POP_RELIGION (ids 91–97) — manual ───────────────────────────────
        none(91), none(92), none(93), none(94), none(95), none(96), none(97),

        # ── ECON_KPI (ids 98–103) ───────────────────────────────────────────
        item(98,  f'{W}.gdp_usd',             'usd_B',    'World Bank {year}'),
        item(99,  f'{W}.gdp_per_capita_usd',  'usd_comma','World Bank {year}'),
        item(100, f'{W}.gdp_growth_pct',      'pct1s',    'World Bank {year}'),
        item(101, f'{W}.gdp_ppp_usd',         'usd_B',    'World Bank PPP {year}'),
        item(102, f'{W}.inflation_cpi_pct',   'pct1',     'World Bank CPI {year}'),
        none(103, 'Currency name + exchange rate — manual'),

        # ── ECON_GDP_DONUT (ids 104–106) ────────────────────────────────────
        item(104, f'{W}.services_pct_gdp',    'pct1', 'World Bank {year}'),
        item(105, f'{W}.industry_pct_gdp',    'pct1', 'World Bank {year}'),
        item(106, f'{W}.agriculture_pct_gdp', 'pct1', 'World Bank {year}'),

        # ── ECON_EXPORTS_BARS (ids 107–110) — manual ────────────────────────
        none(107), none(108), none(109), none(110),

        # ── ECON_INDICATORS (ids 111–116) ───────────────────────────────────
        (111, {'value': rem_val or '', 'sub': f'World Bank {rem_yr}' if rem_val else 'Manual entry required', 'state': 1 if rem_val else 0}),
        none(112, 'Country-specific — manual'),
        item(113, f'{W}.foreign_reserves_usd',     'usd_B',  'World Bank {year}'),
        item(114, f'{W}.fdi_inflow_usd',           'usd_B',  'World Bank {year}'),
        item(115, f'{W}.poverty_headcount_365_pct','pct1',   'World Bank {year}'),
        item(116, f'{W}.gini_index',               'f1',     'World Bank {year}'),

        # ── EMP_KPI (ids 117–122) ───────────────────────────────────────────
        none(117, 'Avg monthly wage — ILO / national stats'),
        none(118, 'Labour force total — ILO modelled'),
        item(119, f'{W}.unemployment_pct',           'pct1', 'ILO modelled {year}'),
        item(120, f'{W}.vulnerable_employment_pct',  'pct1', 'World Bank {year}'),
        item(121, f'{W}.female_unemployment_pct',    'pct1', 'ILO modelled {year}'),
        item(122, f'{W}.labour_force_participation_pct','pct1','ILO modelled {year}'),

        # ── EMP_WAGES (ids 123–128) — manual ────────────────────────────────
        none(123), none(124), none(125), none(126), none(127), none(128),

        # ── EMP_SECTORS_DONUT (ids 129–134) ─────────────────────────────────
        item(129, f'{W}.employment_agriculture_pct','pct1', 'ILO {year}'),
        item(130, f'{W}.employment_services_pct',   'pct1', 'ILO {year}'),
        item(131, f'{W}.employment_industry_pct',   'pct1', 'ILO {year}'),
        item(132, f'{W}.youth_unemployment_pct',    'pct1', 'ILO modelled {year}'),
        item(133, f'{W}.female_labour_force_pct',   'pct1', 'ILO modelled {year}'),
        item(134, f'{W}.wage_workers_pct',          'pct1', 'World Bank {year}'),

        # ── EMP_MIGRATION (ids 135–136) ─────────────────────────────────────
        none(135, 'Migrant workers abroad — ILO / national stats'),
        (136, {'value': rem_val or '', 'sub': f'World Bank {rem_yr}' if rem_val else 'Manual entry required', 'state': 1 if rem_val else 0}),

        # ── EDU_KPI (ids 137–142) ───────────────────────────────────────────
        item(137, f'{W}.literacy_rate_adult_pct',       'pct1', 'World Bank {year}'),
        none(138, 'HDI value — check UNDP HDR'),
        none(139, 'Avg years schooling — UNDP HDR'),
        none(140, 'Expected years schooling — UNDP HDR'),
        item(141, f'{W}.education_expenditure_pct_gdp', 'pct1', 'World Bank {year}'),
        none(142, 'Foreign university branches — manual'),

        # ── EDU_METRICS (ids 143–147) ───────────────────────────────────────
        none(143),
        item(144, f'{W}.school_enrollment_secondary_pct','pct1','World Bank {year}'),
        item(145, f'{W}.school_enrollment_tertiary_pct', 'pct1','World Bank {year}'),
        none(146), none(147),

        # ── EDU_FACTS (ids 148–153) — manual ────────────────────────────────
        none(148), none(149), none(150), none(151), none(152), none(153),

        # ── POL_KPI (ids 154–159) ───────────────────────────────────────────
        none(154, 'Government system — manual'),
        (155, {'value': str(hos_raw) if hos_raw else '', 'sub': 'Wikidata' if hos_raw else 'Manual entry required', 'state': 1 if hos_raw else 0}),
        item(156, f'{W}.women_in_parliament_pct', 'pct1', 'World Bank {year}'),
        none(157, 'Next election date — manual'),
        none(158, 'Ruling party — manual'),
        (159, {'value': _jfmt(ind_raw, 'date') if ind_raw else '', 'sub': 'Wikidata' if ind_raw else 'Manual entry required', 'state': 1 if ind_raw else 0}),

        # ── POL_ELECTION (ids 160–161) — manual ─────────────────────────────
        none(160), none(161),

        # ── POL_TIMELINE (ids 162–167) — manual ─────────────────────────────
        none(162), none(163), none(164), none(165), none(166), none(167),

        # ── TOUR_KPI (ids 168–173) ──────────────────────────────────────────
        item(168, f'{W}.tourism_arrivals',        'int',   'World Bank {year}'),
        item(169, f'{W}.tourism_receipts_usd',    'usd_M', 'World Bank {year}'),
        none(170, 'Top tourist draw — manual'),
        none(171, 'Visa-free countries — Passport Index / manual'),
        none(172, 'UNESCO sites — manual'),
        none(173, 'Visitor target — national strategy / manual'),

        # ── TOUR_ORIGINS (ids 174–179) — manual ─────────────────────────────
        none(174), none(175), none(176), none(177), none(178), none(179),

        # ── TOUR_HIGHLIGHTS (ids 180–186) — manual ──────────────────────────
        none(180), none(181), none(182), none(183), none(184), none(185), none(186),

        # ── VITA_KPI (ids 187–192) ──────────────────────────────────────────
        item(187, f'{W}.birth_rate_per1k',          'per1k',  'World Bank {year}'),
        item(188, f'{W}.death_rate_per1k',          'per1k',  'World Bank {year}'),
        item(189, f'{W}.pop_0_14_pct',              'pct1',   'World Bank {year}'),
        item(190, f'{W}.pop_65plus_pct',            'pct1',   'World Bank {year}'),
        item(191, f'{W}.under5_mortality_per1k',    'per1k',  'World Bank {year}'),
        item(192, f'{W}.infant_mortality_per1k',    'per1k',  'World Bank {year}'),

        # ── VITA_DEATHS (ids 193–199) — auto-generated block, skip ──────────

        # ── VITA_TRENDS (ids 200–205) — manual ──────────────────────────────
        none(200), none(201), none(202), none(203), none(204), none(205),

        # ── HEALTH_KPI (ids 206–211) ────────────────────────────────────────
        item(206, f'{W}.health_expenditure_pct_gdp', 'pct1',     'World Bank {year}'),
        item(207, f'{W}.out_of_pocket_health_pct',   'pct1',     'World Bank {year}'),
        item(208, f'{W}.tb_incidence_per100k',        'per100k',  'World Bank {year}'),
        (209, {'value': life_exp or '', 'sub': f'World Bank {yr_le}' if life_exp else 'Manual entry required', 'state': 1 if life_exp else 0}),
        item(210, f'{W}.physicians_per1k',            'f2',       'World Bank {year}'),
        item(211, f'{W}.pm25_mean_annual_ugm3',       'ugm3',     'World Bank / WHO {year}'),

        # ── HEALTH_FACTS (ids 212–217) ──────────────────────────────────────
        none(212, 'Health insurance system — manual'),
        item(213, f'{W}.hospital_beds_per1k',         'f2',    'World Bank {year}'),
        item(214, f'{W}.nurses_per1k',                'f2',    'World Bank {year}'),
        item(215, f'{W}.stunting_pct_under5',         'pct1',  'World Bank {year}'),
        item(216, f'{W}.maternal_mortality_per100k',  'per100k','World Bank {year}'),
        item(217, f'{W}.health_exp_per_capita_usd',   'usd_comma','World Bank {year}'),

        # ── HEALTH_BURDEN (ids 218–222) ─────────────────────────────────────
        (218, {'value': _jfmt(_jval(output,'who.hypertension_prevalence_pct'),'pct1') or '', 'sub': f'WHO GHO {_jyear(output,"who.hypertension_prevalence_pct")}' if _jval(output,'who.hypertension_prevalence_pct') else 'Manual entry required', 'state': 1 if _jval(output,'who.hypertension_prevalence_pct') else 0}),
        item(219, f'{W}.tb_incidence_per100k',        'per100k','World Bank {year}'),
        item(220, f'{W}.out_of_pocket_health_pct',    'pct1',  'World Bank {year}'),
        item(221, f'{W}.pm25_mean_annual_ugm3',       'ugm3',  'World Bank / WHO {year}'),
        none(222, 'Country-specific health burden — manual'),

        # ── ENERGY_KPI (ids 223–228) ────────────────────────────────────────
        item(223, f'{W}.renewable_electricity_pct',   'pct1', 'World Bank {year}'),
        item(224, f'{W}.access_electricity_pct',      'pct1', 'World Bank {year}'),
        none(225, 'Key resource — country-specific / manual'),
        item(226, f'{W}.energy_use_kg_oil_per_cap',   'kgoe', 'World Bank {year}'),
        none(227, 'Energy potential — manual'),
        none(228, 'Energy project — manual'),

        # ── ENERGY_MIX (ids 229–232) — auto-generated block, skip ───────────

        # ── ENERGY_FACTS (ids 233–238) — manual ─────────────────────────────
        none(233), none(234), none(235), none(236), none(237), none(238),

        # ── INFRA_KPI (ids 239–244) — manual ────────────────────────────────
        none(239), none(240), none(241), none(242), none(243), none(244),

        # ── INFRA_PROJECTS (ids 245–250) — manual ───────────────────────────
        none(245), none(246), none(247), none(248), none(249), none(250),

        # ── INFRA_DIGITAL (ids 251–255) ─────────────────────────────────────
        item(251, f'{W}.internet_users_pct',           'pct1',   'World Bank {year}'),
        item(252, f'{W}.mobile_subscriptions_per100',  'per100', 'World Bank {year}'),
        none(253, 'E-government uptake — manual'),
        none(254, 'Social media penetration — manual'),
        item(255, f'{W}.fixed_broadband_per100',       'per100', 'World Bank {year}'),

        # ── SOCIAL_KPI (ids 256–261) ────────────────────────────────────────
        item(256, f'{W}.poverty_headcount_365_pct',    'pct1', 'World Bank {year}'),
        item(257, f'{W}.gini_index',                   'f1',   'World Bank {year}'),
        item(258, f'{W}.poverty_headcount_685_pct',    'pct1', 'World Bank {year}'),
        none(259, 'Gender Inequality Index — UNDP HDR'),
        item(260, f'{W}.women_in_parliament_pct',      'pct1', 'World Bank {year}'),
        item(261, f'{W}.international_migrants_pct',   'pct1', 'World Bank {year}'),

        # ── SOCIAL_SERVICES (ids 262–266) ───────────────────────────────────
        item(262, f'{W}.access_clean_water_pct',       'pct1', 'World Bank {year}'),
        item(263, f'{W}.rural_population_pct',         'pct1', 'World Bank {year}'),
        item(264, f'{W}.urban_population_total',       'pop_exact','World Bank {year}'),
        item(265, f'{W}.access_sanitation_pct',        'pct1', 'World Bank {year}'),
        item(266, f'{W}.access_electricity_pct',       'pct1', 'World Bank {year}'),

        # ── SOCIAL_COHESION (ids 267–272) — manual ──────────────────────────
        none(267), none(268), none(269), none(270), none(271), none(272),

        # ── ENV_KPI (ids 273–278) ───────────────────────────────────────────
        item(273, f'{W}.co2_per_capita_tons',           'f1',   'World Bank {year}'),
        item(274, f'{W}.forest_area_pct',              'pct1', 'World Bank {year}'),
        item(275, f'{W}.renewable_electricity_pct',    'pct1', 'World Bank {year}'),
        item(276, f'{W}.renewable_freshwater_per_cap', 'm3',   'World Bank {year}'),
        item(277, f'{W}.forest_area_km2',              'km2',  'World Bank {year}'),
        item(278, f'{W}.pm25_mean_annual_ugm3',        'ugm3', 'World Bank / WHO {year}'),

        # ── ENV_FACTS (ids 279–284) — manual ────────────────────────────────
        none(279), none(280), none(281), none(282), none(283), none(284),

        # ── ENV_WATER (ids 285–288) ──────────────────────────────────────────
        item(285, f'{W}.agricultural_land_pct',        'pct1', 'World Bank {year}'),
        none(286, 'Irrigation efficiency — manual'),
        item(287, f'{W}.pm25_mean_annual_ugm3',        'ugm3', 'World Bank / WHO {year}'),
        none(288, 'Water event — manual'),

        # ── BIZ_KPI (ids 289–294) — manual ──────────────────────────────────
        none(289), none(290), none(291), none(292),
        (293, {'value': _jfmt(ti_raw, 'cpi') if ti_raw else '', 'sub': f'Transparency International {ti_yr}' if ti_raw else 'Manual entry required', 'state': 1 if ti_raw else 0}),
        none(294),

        # ── BIZ_CLIMATE (ids 295–300) — manual ──────────────────────────────
        none(295), none(296), none(297), none(298), none(299), none(300),

        # ── BIZ_RISKS (ids 301–306) — manual ────────────────────────────────
        none(301), none(302), none(303), none(304), none(305), none(306),

        # ── FISCAL_KPI (ids 307–312) ────────────────────────────────────────
        item(307, f'{W}.foreign_reserves_usd',         'usd_B',  'World Bank {year}'),
        item(308, f'{W}.govt_debt_pct_gdp',            'pct1',   'World Bank {year}'),
        item(309, f'{W}.fdi_inflow_usd',               'usd_B',  'World Bank {year}'),
        item(310, f'{W}.exports_usd',                  'usd_B',  'World Bank {year}'),
        item(311, f'{W}.imports_usd',                  'usd_B',  'World Bank {year}'),
        item(312, f'{W}.current_account_pct_gdp',      'pct1s',  'World Bank {year}'),

        # ── FISCAL_EXPORTS (ids 313–318) — manual ───────────────────────────
        none(313), none(314), none(315), none(316), none(317), none(318),

        # ── FISCAL_INDICATORS (ids 319–325) ─────────────────────────────────
        item(319, f'{W}.govt_debt_pct_gdp',            'pct1',   'World Bank {year}'),
        item(320, f'{W}.foreign_reserves_usd',         'usd_B',  'World Bank {year}'),
        item(321, f'{W}.gross_capital_formation_pct',  'pct1',   'World Bank {year}'),
        item(322, f'{W}.gross_savings_pct_gdp',        'pct1',   'World Bank {year}'),
        item(323, f'{W}.trade_pct_gdp',                'pct1',   'World Bank {year}'),
        item(324, f'{W}.tax_revenue_pct_gdp',          'pct1',   'World Bank {year}'),
        item(325, f'{W}.govt_expenditure_pct_gdp',     'pct1',   'World Bank {year}'),

        # ── CRIME_KPI (ids 326–331) ─────────────────────────────────────────
        (326, {'value': _jfmt(gpi_raw, 'gpi') if gpi_raw else '', 'sub': f'IEP GPI {gpi_year}' if gpi_raw else 'Manual entry required', 'state': 1 if gpi_raw else 0}),
        none(327, 'Border/security context — manual'),
        item(328, f'{W}.homicide_rate_per100k',        'per100k2','World Bank/UNODC {year}'),
        (329, {'value': _jfmt(rsf_raw, 'f1') if rsf_raw else '', 'sub': f'RSF {rsf_yr}' if rsf_raw else 'Manual entry required', 'state': 1 if rsf_raw else 0}),
        none(330, 'Security event — manual'),
        none(331, 'Historical event — manual'),

        # ── CRIME_INDICATORS (ids 332–337) ──────────────────────────────────
        item(332, f'{W}.homicide_rate_per100k',            'per100k2','World Bank/UNODC {year}'),
        (333, {'value': _jfmt(gpi_raw, 'gpi') if gpi_raw else '', 'sub': f'IEP GPI {gpi_year}' if gpi_raw else 'Manual entry required', 'state': 1 if gpi_raw else 0}),
        (334, {'value': _jfmt(_jval(output,'wgi.rule_of_law_estimate'),'wgi') or '', 'sub': f'World Bank WGI {_jyear(output,"wgi.rule_of_law_estimate")}' if _jval(output,'wgi.rule_of_law_estimate') else 'Manual entry required', 'state': 1 if _jval(output,'wgi.rule_of_law_estimate') else 0}),
        (335, {'value': _jfmt(_jval(output,'wgi.political_stability_estimate'),'wgi') or '', 'sub': f'World Bank WGI {_jyear(output,"wgi.political_stability_estimate")}' if _jval(output,'wgi.political_stability_estimate') else 'Manual entry required', 'state': 1 if _jval(output,'wgi.political_stability_estimate') else 0}),
        (336, {'value': _jfmt(_jval(output,'wgi.control_corruption_estimate'),'wgi') or '', 'sub': f'World Bank WGI {_jyear(output,"wgi.control_corruption_estimate")}' if _jval(output,'wgi.control_corruption_estimate') else 'Manual entry required', 'state': 1 if _jval(output,'wgi.control_corruption_estimate') else 0}),
        (337, {'value': _jfmt(_jval(output,'wgi.voice_accountability_estimate'),'wgi') or '', 'sub': f'World Bank WGI {_jyear(output,"wgi.voice_accountability_estimate")}' if _jval(output,'wgi.voice_accountability_estimate') else 'Manual entry required', 'state': 1 if _jval(output,'wgi.voice_accountability_estimate') else 0}),

        # ── CRIME_SECURITY (ids 338–341) ────────────────────────────────────
        (338, {'value': _jfmt(ti_raw, 'cpi') if ti_raw else '', 'sub': f'TI {ti_yr}' if ti_raw else 'Manual entry required', 'state': 1 if ti_raw else 0}),
        (339, {'value': _jfmt(rsf_raw, 'f1') if rsf_raw else '', 'sub': f'RSF {rsf_yr}' if rsf_raw else 'Manual entry required', 'state': 1 if rsf_raw else 0}),
        (340, {'value': _jfmt(wjp_raw, 'f2') if wjp_raw else '', 'sub': f'WJP {wjp_yr}' if wjp_raw else 'Manual entry required', 'state': 1 if wjp_raw else 0}),
        (341, {'value': _jfmt(fh_raw, 'fh') if fh_raw else '', 'sub': f'Freedom House {fh_yr}' if fh_raw else 'Manual entry required', 'state': 1 if fh_raw else 0}),
    ])

    # ── Auto-generated blocks (full replacement, not by_id) ──────────────────
    # CLIMA_DAYLIGHT, VITA_DEATHS, ENERGY_MIX, POP_CITIES
    dl = output.get('daylight') or {}
    monthly_dl = dl.get('monthly', {})
    capital    = output.get('meta', {}).get('capital', 'capital')
    lat        = output.get('meta', {}).get('lat', 0)
    lat_str    = f'{abs(lat):.1f}°{"N" if lat >= 0 else "S"}'

    if monthly_dl:
        hours_list = [monthly_dl.get(m, 12.0) for m in months_ord]
        max_h = max(hours_list); min_h = min(hours_list)
        max_mo = months_ord[hours_list.index(max_h)]
        min_mo = months_ord[hours_list.index(min_h)]
        dl_items = []
        for i, mo in enumerate(months_ord):
            h = hours_list[i]
            pct = round((h / max_h) * 100)
            lbl = _daylight_str(h)
            is_max = (mo == max_mo); is_min = (mo == min_mo)
            is_cold = h <= min_h + (max_h - min_h) * 0.25
            dl_items.append({'mo': mo, 'label': lbl + (' ★' if is_max or is_min else ''),
                             'pct': pct, 'primary': is_max, 'blu': is_min or (is_cold and not is_max)})
        auto_daylight = {'_auto': True, 'title': f'Daylight Hours — {capital} ({lat_str})',
                         'max_label': _daylight_str(max_h), 'min_label': _daylight_str(min_h),
                         'lat_str': lat_str, 'items': dl_items}
    else:
        auto_daylight = {'_auto': False}

    if monthly_cl:
        temps  = [round(monthly_cl.get(m, {}).get('temp_mean_c', 0), 1) for m in months_ord]
        precip = [round(monthly_cl.get(m, {}).get('precip_mm', 0) / 30, 1) for m in months_ord]
        clima_gradbar = {'location': climate.get('location', capital), 'temps': temps, 'precip': precip,
                         'note': 'Open-Meteo 1991–2020 normals. precip = 30-yr monthly total ÷ 30.'}
    else:
        clima_gradbar = None

    ncd  = _jval(output, f'{W}.death_noncommunicable_pct')
    comm = _jval(output, f'{W}.death_communicable_pct')
    inj  = _jval(output, f'{W}.death_injury_pct')
    vd_yr = _jyear(output, f'{W}.death_noncommunicable_pct')
    if ncd and comm and inj:
        ncd_f = float(ncd); comm_f = float(comm); inj_f = float(inj)
        auto_deaths = {'_auto': True, 'year': vd_yr, 'items': [
            {'label': 'Non-communicable diseases', 'value': f'{ncd_f:.1f}%',  'pct': 100},
            {'label': 'Communicable diseases',     'value': f'{comm_f:.1f}%', 'pct': round((comm_f/ncd_f)*100)},
            {'label': 'Injuries',                  'value': f'{inj_f:.1f}%',  'pct': round((inj_f/ncd_f)*100)},
        ]}
    else:
        auto_deaths = {'_auto': False}

    coal  = _jval(output, f'{W}.electricity_coal_pct')
    hydro = _jval(output, f'{W}.electricity_hydro_pct')
    gas   = _jval(output, f'{W}.electricity_gas_pct')
    nuke  = _jval(output, f'{W}.electricity_nuclear_pct')
    renew = _jval(output, f'{W}.electricity_renewables_excl_hydro_pct')
    em_yr = _jyear(output, f'{W}.electricity_coal_pct')
    if any([coal, hydro, gas]):
        segs = []
        if coal  and float(coal)  > 0: segs.append(('Coal',             float(coal),  'dim'))
        if hydro and float(hydro) > 0: segs.append(('Hydro',            float(hydro), 'primary'))
        if gas   and float(gas)   > 0: segs.append(('Natural gas',      float(gas),   'secondary'))
        if nuke  and float(nuke)  > 0: segs.append(('Nuclear',          float(nuke),  'red'))
        if renew and float(renew) > 0: segs.append(('Wind/solar/other', float(renew), 'blu'))
        segs.sort(key=lambda x: x[1], reverse=True)
        max_pct = segs[0][1] if segs else 1
        auto_energy = {'_auto': True, 'year': em_yr,
                       'items': [{'label': l, 'value': f'{v:.1f}%', 'pct': round((v/max_pct)*100), 'color_role': r} for l, v, r in segs]}
    else:
        auto_energy = {'_auto': False}

    cities_raw = _jget(output, 'wikidata.cities_by_population')
    if isinstance(cities_raw, dict): cities_raw = cities_raw.get('value', [])
    if isinstance(cities_raw, list) and cities_raw:
        seen = {}
        for c in cities_raw:
            n, p = c.get('name', ''), c.get('population', 0)
            if n and n not in seen: seen[n] = p
        cities_sorted = sorted(seen.items(), key=lambda x: x[1], reverse=True)[:8]
        auto_cities = {'_auto': True, 'cities': [{'name': n, 'pop': p} for n, p in cities_sorted]}
    else:
        auto_cities = {'_auto': False}

    # Remap integer keys → composite "G:N" strings matching grp:G, id:N in JSX.
    # grp:0 = TILES; grp:1–15 = §1–§15. ids are continuous across all constants
    # within a section. Segments: (grp, start_old_global_id, total_count).
    _SEGMENTS = [
        (0,   1,  16),  # TILES
        (1,  17,  24),  # §1  GEO (GEO+TERRAIN+WATER+REGIONS)
        (2,  41,  29),  # §2  CLIMATE (KPI+DAYLIGHT+RAIN_REGIONAL+RAIN_SEASONAL)
        (3,  70,  28),  # §3  POP (KPI+GROWTH+CITIES+ETHNIC+RELIGION)
        (4,  98,  19),  # §4  ECON (KPI+DONUT+EXPORTS+INDICATORS)
        (5, 117,  20),  # §5  EMP (KPI+WAGES+SECTORS+MIGRATION)
        (6, 137,  17),  # §6  EDU (KPI+METRICS+FACTS)
        (7, 154,  14),  # §7  POL (KPI+ELECTION+TIMELINE)
        (8, 168,  19),  # §8  TOUR (KPI+ORIGINS+HIGHLIGHTS)
        (9, 187,  36),  # §9  VITA+HEALTH (VITA_KPI+DEATHS+TRENDS+HEALTH_KPI+FACTS+BURDEN)
        (10, 223, 16),  # §10 ENERGY (KPI+MIX+FACTS)
        (11, 239, 17),  # §11 INFRA (KPI+PROJECTS+DIGITAL)
        (12, 256, 17),  # §12 SOCIAL (KPI+SERVICES+COHESION)
        (13, 273, 16),  # §13 ENV (KPI+FACTS+WATER)
        (14, 289, 37),  # §14 BIZ+FISCAL (BIZ_KPI+CLIMATE+RISKS+FISCAL_KPI+EXPORTS+INDICATORS)
        (15, 326, 16),  # §15 CRIME (KPI+INDICATORS+SECURITY)
    ]
    _REMAP = {}
    for grp_n, start, count in _SEGMENTS:
        for local in range(1, count + 1):
            _REMAP[start + local - 1] = f'{grp_n}:{local}'

    by_id_composite = {_REMAP[k]: v for k, v in by_id.items() if k in _REMAP}

    return {
        'by_id':         by_id_composite,
        'auto_daylight': auto_daylight,
        'auto_deaths':   auto_deaths,
        'auto_energy':   auto_energy,
        'auto_cities':   auto_cities,
        'clima_gradbar': clima_gradbar,
    }


# ──────────────────────────────────────────────────────────────────────────────
# COUNTRY RESOLUTION — fully automatic, no lookup table
# ──────────────────────────────────────────────────────────────────────────────
def resolve_country(iso_input):
    """
    Resolves all country metadata from the ISO code alone.
    Returns (name, iso2, iso3, un_numeric, lat, lon, capital) or None.
    """
    iso = iso_input.strip().upper()

    # ── Step 1: World Bank country API → name, iso2, iso3, capital name ──────
    print(f'  Resolving country from ISO code: {iso}')
    try:
        r = SESSION.get(
            f'https://api.worldbank.org/v2/country/{iso}?format=json',
            timeout=10
        )
        r.raise_for_status()
        body = r.json()
        if len(body) < 2 or not body[1]:
            print(f'  ❌ World Bank: no country found for "{iso}"')
            return None
        c       = body[1][0]
        iso2    = c.get('iso2Code', '').strip().upper()
        iso3    = c.get('id', '').strip().upper()
        name    = c.get('name', iso)
        capital = c.get('capitalCity', '').strip()
        print(f'  ✅ World Bank  → {name} | ISO2: {iso2} | ISO3: {iso3} | Capital: {capital}')
    except Exception as e:
        print(f'  ❌ World Bank failed: {e}')
        return None

    # ── Step 2: REST Countries API → UN numeric code + capital lat/lon ────────
    un_numeric    = None
    lat           = None
    lon           = None
    currency_code = None
    currency_name = None
    languages     = []
    borders       = []
    try:
        rc_tpl = _cfg('rest_countries', 'base_url',
                      default='https://restcountries.com/{api_version}/alpha/{iso2}')
        rc_url = rc_tpl.format(
            api_version=_cfg('rest_countries', 'api_version', default='v3.1'),
            iso2=iso2,
        )
        r = SESSION.get(rc_url, timeout=10)
        r.raise_for_status()
        data = r.json()
        if isinstance(data, list) and data:
            entry      = data[0]
            un_numeric = int(entry.get('ccn3', 0)) or None
            cap_info   = entry.get('capitalInfo', {})
            latlng     = cap_info.get('latlng', [])
            if len(latlng) == 2:
                lat = round(latlng[0], 4)
                lon = round(latlng[1], 4)
            # Currency
            currencies = entry.get('currencies', {})
            if currencies:
                currency_code = next(iter(currencies))
                currency_name = currencies[currency_code].get('name', '')
            # Languages
            languages = list(entry.get('languages', {}).values())
            # Bordering countries (ISO3 codes)
            borders = entry.get('borders', [])
        print(f'  ✅ REST Countries → UN numeric: {un_numeric} | Lat/Lon: {lat}, {lon}')
        if currency_code:
            print(f'                     Currency: {currency_code} ({currency_name})')
        if languages:
            print(f'                     Languages: {", ".join(languages)}')
        if borders:
            print(f'                     Borders: {", ".join(borders)}')
    except Exception as e:
        print(f'  ⚠  REST Countries failed: {e}')

    # ── Step 3: Nominatim fallback if lat/lon still missing ───────────────────
    if (lat is None or lon is None) and capital:
        try:
            r = SESSION.get(
                'https://nominatim.openstreetmap.org/search',
                params={'q': f'{capital}, {name}', 'format': 'json', 'limit': 1},
                headers={'User-Agent': 'DashboardDataFetcher/1.0'},
                timeout=10
            )
            r.raise_for_status()
            results = r.json()
            if results:
                lat = round(float(results[0]['lat']), 4)
                lon = round(float(results[0]['lon']), 4)
                print(f'  ✅ Nominatim (fallback) → Lat/Lon: {lat}, {lon}')
            else:
                print(f'  ⚠  Nominatim: no result for "{capital}"')
        except Exception as e:
            print(f'  ⚠  Nominatim failed: {e}')

    if lat is None or lon is None:
        print(f'  ⚠  No coordinates found — climate data will be skipped')

    return (name, iso2, iso3, un_numeric, lat, lon, capital,
            currency_code, currency_name, languages, borders)

# ──────────────────────────────────────────────────────────────────────────────
# MAIN
# ──────────────────────────────────────────────────────────────────────────────
def main():
    if len(sys.argv) != 2 or not sys.argv[1].isalpha() or len(sys.argv[1]) not in (2, 3):
        print('Usage: python tools/fetch_dashboard_data.py <ISO2 or ISO3>')
        print('       python tools/fetch_dashboard_data.py BIH')
        print('       python tools/fetch_dashboard_data.py BA')
        print('       python tools/fetch_dashboard_data.py UZB')
        print('\nAccepts ISO 3166 Alpha-2 (2 letters) or Alpha-3 (3 letters) only.')
        sys.exit(1)

    country = resolve_country(sys.argv[1])
    if not country:
        print(f'\nError: could not resolve country from "{sys.argv[1]}".\n')
        sys.exit(1)

    name, iso2, iso3, un_numeric, lat, lon, capital, \
        currency_code, currency_name, languages, borders = country

    print(f'\n{"═"*56}')
    print(f'  Dashboard Data Fetcher')
    print(f'  Country : {name}')
    print(f'  ISO     : {iso2} / {iso3} / UN-{un_numeric}')
    print(f'  Capital : {capital} ({lat}, {lon})')
    print(f'  Started : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print(f'{"═"*56}\n')

    output = {
        'meta': {
            'country':       name,
            'iso2':          iso2,
            'iso3':          iso3,
            'un_numeric':    un_numeric,
            'capital':       capital,
            'lat':           lat,
            'lon':           lon,
            'currency_code': currency_code,
            'currency_name': currency_name,
            'languages':     languages,
            'borders':       borders,
            'fetched_at':    datetime.now().isoformat(),
        },
        'world_bank':   {},
        'imf':          {},
        'undp':         {},
        'un_wpp':       {},
        'wgi':          {},
        'who':          {},
        'wikidata':     {},
        'ilo':          {},
        'indexes':      {},
        'exchange_rate': None,
        'daylight':     None,
        'climate':      None,
    }

    # ── 1. World Bank ──────────────────────────────────────────
    total_wb = len(WB_INDICATORS)
    found_wb = 0
    print(f'[1/10] World Bank Open Data ({total_wb} indicators)')
    for field, code in WB_INDICATORS.items():
        result = fetch_worldbank(iso2, code, field)
        if result:
            output['world_bank'][field] = result
            found_wb += 1
            print(f'  ✅  {field:<42}  {result["value"]}  ({result["year"]})')
        else:
            output['world_bank'][field] = {'status': -1, 'value': None, 'indicator': code}
            print(f'  ❌  {field}')
        time.sleep(0.12)

    # ── 2. IMF WEO ────────────────────────────────────────────
    total_imf = len(IMF_INDICATORS)
    found_imf = 0
    print(f'\n[2/10] IMF WEO DataMapper ({total_imf} indicators)')
    for field, code in IMF_INDICATORS.items():
        result = fetch_imf(iso3, code, field)
        if result:
            output['imf'][field] = result
            found_imf += 1
            print(f'  ✅  {field:<42}  {result["value"]}  ({result["year"]})')
        else:
            output['imf'][field] = {'status': -1, 'value': None, 'indicator': code}
            print(f'  ❌  {field}')
        time.sleep(0.2)

    # ── 3. UNDP HDR ───────────────────────────────────────────
    print(f'\n[3/10] UNDP Human Development Report')
    undp = fetch_undp(iso3)
    if undp:
        output['undp'] = undp
        for k, v in undp.items():
            print(f'  ✅  {v["label"]:<42}  {v["value"]}  ({v["year"]})')
    else:
        output['undp'] = {'_fetch': {'status': -1, 'value': None, 'indicator': 'UNDP_HDR'}}
        print(f'  ❌  No UNDP data returned')

    # ── 4. UN World Population Prospects ─────────────────────
    print(f'\n[4/10] UN World Population Prospects')
    if un_numeric:
        wpp = fetch_un_wpp(un_numeric)
        if wpp:
            output['un_wpp'] = wpp
            for k, v in wpp.items():
                print(f'  ✅  {v["label"]:<42}  {v["value"]}  ({v["year"]})')
        else:
            output['un_wpp'] = {'_fetch': {'status': -1, 'value': None, 'indicator': 'UN_WPP'}}
            print(f'  ❌  No UN WPP data returned')
    else:
        output['un_wpp'] = {'_fetch': {'status': -1, 'value': None, 'indicator': 'UN_WPP', 'reason': 'no UN numeric ID resolved'}}
        print(f'  ❌  Skipped — UN numeric ID could not be resolved')

    # ── 5. Indexes (TI CPI live + CSV fallback for others) ───
    print(f'\n[5/11] Indexes (TI CPI + Freedom House xlsx; GPI / RSF / WJP from CSV)')
    print(f'  Fetching TI CPI from transparency.org …')
    ti_live = fetch_ti_cpi_live(iso3)
    if ti_live:
        rank_str = f'  rank {ti_live["rank"]}' if 'rank' in ti_live else ''
        print(f'  ✅  TI CPI (live)  score {ti_live["value"]}{rank_str}  ({ti_live["year"]})')
    else:
        print(f'  ⚠  TI CPI live fetch failed — will use CSV fallback if available')

    print(f'  Fetching Freedom House from freedomhouse.org (xlsx) …')
    fh_live = fetch_freedom_house_xlsx(iso3, name)
    if fh_live:
        print(f'  ✅  Freedom House (xlsx)  score {fh_live["value"]}/100  {fh_live.get("status_label", "")}  ({fh_live["year"]})')
    else:
        print(f'  ⚠  Freedom House xlsx fetch failed — will use CSV fallback if available')

    indexes = fetch_indexes(iso3, ti_cpi_live=ti_live, fh_live=fh_live)
    output['indexes'] = indexes
    for k, v in indexes.items():
        if k in ('ti_cpi', 'fh') and (ti_live if k == 'ti_cpi' else fh_live):
            continue  # already printed above
        rank_str = f'  rank {v["rank"]}' if 'rank' in v else ''
        print(f'  ✅  {v["source"]:<42} (CSV)  {v["value"]}{rank_str}  ({v["year"]})')
    if not indexes:
        print(f'  ❌  No index data found for {iso3}')

    # ── 6. WGI ───────────────────────────────────────────────
    print(f'\n[6/11] World Bank WGI (governance indicators)')
    wgi = fetch_wgi(iso2)
    if wgi:
        output['wgi'] = wgi
        for k, v in wgi.items():
            print(f'  ✅  {v["label"]:<52}  {v["value"]}  ({v["year"]})')
    else:
        print(f'  ❌  No WGI data returned')

    # ── 7. WHO GHO ───────────────────────────────────────────
    print(f'\n[7/11] WHO Global Health Observatory')
    who = fetch_who_gho(iso3)
    if who:
        output['who'] = who
        for k, v in who.items():
            print(f'  ✅  {v["label"]:<42}  {v["value"]}  ({v["year"]})')
    else:
        print(f'  ❌  No WHO data returned')

    # ── 8. Wikidata ──────────────────────────────────────────
    print(f'\n[8/11] Wikidata (SPARQL)')
    wikidata = fetch_wikidata(iso2)
    if wikidata:
        output['wikidata'] = wikidata
        for k, v in wikidata.items():
            val = v['value'] if not isinstance(v['value'], list) else f'{len(v["value"])} cities'
            print(f'  ✅  {v["label"]:<42}  {val}')
    else:
        print(f'  ❌  No Wikidata returned')

    # ── 9. ILO wages ─────────────────────────────────────────
    print(f'\n[9/11] ILO ILOSTAT (sector wages)')
    ilo = fetch_ilo_wages(iso2)
    if ilo:
        output['ilo'] = ilo
        for k, v in ilo.items():
            print(f'  ✅  {v["label"]:<42}  {v["value"]}  ({v["year"]})')
    else:
        print(f'  ❌  No ILO wage data returned')

    # ── 10. Exchange rate ─────────────────────────────────────
    print(f'\n[10/11] Frankfurter exchange rate')
    if currency_code:
        xrate = fetch_exchange_rate(currency_code)
        if xrate:
            output['exchange_rate'] = xrate
            print(f'  ✅  {xrate["label"]}  ({xrate["date"]})')
        else:
            print(f'  ❌  Exchange rate fetch failed for {currency_code}')
    else:
        print(f'  ❌  Skipped — currency code not resolved')

    # ── 11. Daylight ──────────────────────────────────────────
    print(f'\n[11/11] Daylight hours (computed from latitude)')
    if lat is not None:
        daylight = compute_daylight(lat)
        output['daylight'] = daylight
        print(f'  ✅  12 months computed for lat={lat}')
    else:
        print(f'  ❌  Skipped — latitude not resolved')

    # ── Climate ───────────────────────────────────────────────
    print(f'\n[Climate] Open-Meteo Climate Archive (1991–2020 normals)')
    if lat and lon:
        climate = fetch_climate(lat, lon, capital)
        if climate:
            output['climate'] = climate
            print(f'  ✅  Annual avg temp : {climate["annual_avg_temp_c"]}°C')
            print(f'  ✅  Annual precip   : {climate["annual_precip_mm"]} mm')
            print(f'  ✅  Warmest month   : {climate["warmest_month"]}')
            print(f'  ✅  Coldest month   : {climate["coldest_month"]}')
            print(f'  ✅  Monthly data    : all 12 months')
        else:
            output['climate'] = {'status': -1, 'value': None}
            print(f'  ❌  Climate fetch failed')
    else:
        output['climate'] = {'status': -1, 'value': None, 'reason': 'coordinates not resolved'}
        print(f'  ❌  Skipped — coordinates could not be resolved')

    # ── Build jsx_ready section ───────────────────────────────
    output['jsx_ready'] = build_jsx_ready(output)

    # ── Write output ──────────────────────────────────────────
    import os
    os.makedirs('data', exist_ok=True)
    outfile = f'data/{iso3.lower()}_data.json'
    with open(outfile, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False, default=str)

    # ── Write patch sheet ─────────────────────────────────────
    _SECTION_LABELS = {
        0:  'TILES',
        1:  '§1  GEOGRAPHY',
        2:  '§2  CLIMATE',
        3:  '§3  POPULATION',
        4:  '§4  ECONOMY',
        5:  '§5  EMPLOYMENT',
        6:  '§6  EDUCATION',
        7:  '§7  POLITICAL',
        8:  '§8  TOURISM',
        9:  '§9  VITAL STATISTICS & HEALTH',
        10: '§10 ENERGY',
        11: '§11 INFRASTRUCTURE',
        12: '§12 SOCIAL',
        13: '§13 ENVIRONMENT',
        14: '§14 BUSINESS & FISCAL',
        15: '§15 CRIME & SECURITY',
    }
    by_id = output['jsx_ready']['by_id']
    patch_lines = [
        f'Patch sheet — {name} ({iso3})',
        f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}',
        f'Format: KEY  VALUE  SOURCE  STATE (①=API sourced  ✗=manual required  ②=web-searched & verified)',
        '',
    ]
    current_grp = None
    for key in sorted(by_id.keys(), key=lambda k: (int(k.split(':')[0]), int(k.split(':')[1]))):
        grp = int(key.split(':')[0])
        if grp != current_grp:
            current_grp = grp
            patch_lines.append('')
            patch_lines.append(f'── {_SECTION_LABELS.get(grp, f"grp:{grp}")} ──')
        entry = by_id[key]
        state_icon = '②' if entry['state'] == 2 else ('①' if entry['state'] == 1 else '✗')
        val  = entry['value'] or '—'
        sub  = entry['sub']  or ''
        patch_lines.append(f"  {key:<6}  {val:<18}  {sub:<40}  {state_icon}")

    # Auto-blocks summary
    patch_lines += [
        '',
        '── AUTO-GENERATED BLOCKS ──',
        f"  CLIMA_DAYLIGHT  {'①' if output['jsx_ready']['auto_daylight'].get('_auto') else '✗'}  (12-month daylight hours from latitude)",
        f"  VITA_DEATHS     {'①' if output['jsx_ready']['auto_deaths'].get('_auto')   else '✗'}  (NCD/communicable/injury split)",
        f"  ENERGY_MIX      {'①' if output['jsx_ready']['auto_energy'].get('_auto')   else '✗'}  (electricity generation mix)",
        f"  POP_CITIES      {'①' if output['jsx_ready']['auto_cities'].get('_auto')   else '✗'}  (largest cities from Wikidata)",
    ]

    patchfile = f'data/{iso3.lower()}_patch.txt'
    with open(patchfile, 'w', encoding='utf-8') as f:
        f.write('\n'.join(patch_lines) + '\n')

    # ── Summary ───────────────────────────────────────────────
    undp_count    = len(output['undp'])
    wpp_count     = len(output['un_wpp'])
    wgi_count     = len(output['wgi'])
    who_count     = len(output['who'])
    wiki_count    = len(output['wikidata'])
    ilo_count     = len(output['ilo'])
    idx_count     = len(output['indexes'])
    xrate_ok      = output['exchange_rate'] is not None
    daylight_ok   = output['daylight'] is not None
    climate_ok    = output['climate'] is not None
    total_fetched = (found_wb + found_imf + undp_count + wpp_count +
                     wgi_count + who_count + wiki_count + ilo_count + idx_count +
                     (1 if xrate_ok else 0) +
                     (12 if daylight_ok else 0) +
                     (12 if climate_ok else 0))

    print(f'\n{"═"*56}')
    print(f'  Summary — {name}')
    print(f'  World Bank  : {found_wb}/{total_wb}')
    print(f'  IMF WEO     : {found_imf}/{total_imf}')
    print(f'  UNDP HDR    : {undp_count} indicators')
    print(f'  UN WPP      : {wpp_count} indicators')
    print(f'  WGI         : {wgi_count}/6 governance indicators')
    print(f'  Indexes     : {idx_count}/5 (TI CPI/GPI/FH/RSF/WJP)')
    print(f'  WHO GHO     : {who_count} indicators')
    print(f'  Wikidata    : {wiki_count} data points')
    print(f'  ILO wages   : {ilo_count} sectors')
    print(f'  Exchange    : {"✅ " + str(output["exchange_rate"]["label"]) if xrate_ok else "failed ❌"}')
    print(f'  Daylight    : {"12 months ✅" if daylight_ok else "failed ❌"}')
    print(f'  Climate     : {"12 months ✅" if climate_ok else "failed ❌"}')
    print(f'  ─────────────────────────────────────────')
    print(f'  Total       : ~{total_fetched} data points fetched')
    print(f'  Output      : {outfile}')
    print(f'  Patch sheet : {patchfile}')
    print(f'{"═"*56}\n')

if __name__ == '__main__':
    main()
