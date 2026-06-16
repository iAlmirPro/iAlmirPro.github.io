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
    - REST Countries API            (UN numeric code, capital lat/lon)
    - Nominatim / OpenStreetMap     (capital coordinates fallback)
    - IMF WEO DataMapper API
    - UNDP HDR API
    - UN World Population Prospects API
    - Open-Meteo Archive API        (climate normals 1991-2020)
"""

import sys
import json
import time
import requests
from datetime import datetime
from collections import defaultdict

# ──────────────────────────────────────────────────────────────────────────────
# COUNTRY RESOLUTION
# All metadata is fetched automatically — no hardcoded lookup table.
#
# Step 1 — World Bank country API   → name, iso2, iso3, capital name
# Step 2 — REST Countries API       → UN numeric code, capital lat/lon
# Step 3 — Nominatim (OSM) fallback → capital lat/lon if step 2 fails
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
    'rule_of_law_estimate':         'RL.EST',                # ❌ ALL: WGI indicators use a separate DB — not served via standard WB API endpoint
    'govt_effectiveness_estimate':  'GE.EST',               # ❌ ALL: same — fetch from https://databank.worldbank.org/source/worldwide-governance-indicators
    'control_corruption_estimate':  'CC.EST',               # ❌ ALL: same
    'voice_accountability_estimate':'VA.EST',               # ❌ ALL: same
    'political_stability_estimate': 'PV.EST',               # ❌ ALL: same
    'regulatory_quality_estimate':  'RQ.EST',               # ❌ ALL: same

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
# ──────────────────────────────────────────────────────────────────────────────
def fetch_undp(iso3):
    url = f'https://api.hdr.undp.org/v3/combination/countries/{iso3}'
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
    base = 'https://population.un.org/dataportalapi/api/v1'
    for ind_id, (field, label) in indicators.items():
        url = (
            f'{base}/data/indicators/{ind_id}/locations/{un_numeric}'
            f'/start/2020/end/2025?format=json&pageNumber=1&pageSize=5'
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
# FETCH: OPEN-METEO CLIMATE ARCHIVE
# Computes 1991-2020 monthly climate normals for the capital city
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
    un_numeric = None
    lat        = None
    lon        = None
    try:
        r = SESSION.get(
            f'https://restcountries.com/v3.1/alpha/{iso2}',
            timeout=10
        )
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
        print(f'  ✅ REST Countries → UN numeric: {un_numeric} | Lat/Lon: {lat}, {lon}')
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

    return (name, iso2, iso3, un_numeric, lat, lon, capital)

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

    name, iso2, iso3, un_numeric, lat, lon, capital = country

    print(f'\n{"═"*56}')
    print(f'  Dashboard Data Fetcher')
    print(f'  Country : {name}')
    print(f'  ISO     : {iso2} / {iso3} / UN-{un_numeric}')
    print(f'  Capital : {capital} ({lat}, {lon})')
    print(f'  Started : {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}')
    print(f'{"═"*56}\n')

    output = {
        'meta': {
            'country':    name,
            'iso2':       iso2,
            'iso3':       iso3,
            'un_numeric': un_numeric,
            'capital':    capital,
            'lat':        lat,
            'lon':        lon,
            'fetched_at': datetime.now().isoformat(),
        },
        'world_bank': {},
        'imf':        {},
        'undp':       {},
        'un_wpp':     {},
        'climate':    None,
    }

    # ── 1. World Bank ──────────────────────────────────────────
    total_wb = len(WB_INDICATORS)
    found_wb = 0
    print(f'[1/5] World Bank Open Data ({total_wb} indicators)')
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
    print(f'\n[2/5] IMF WEO DataMapper ({total_imf} indicators)')
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
    print(f'\n[3/5] UNDP Human Development Report')
    undp = fetch_undp(iso3)
    if undp:
        output['undp'] = undp
        for k, v in undp.items():
            print(f'  ✅  {v["label"]:<42}  {v["value"]}  ({v["year"]})')
    else:
        output['undp'] = {'_fetch': {'status': -1, 'value': None, 'indicator': 'UNDP_HDR'}}
        print(f'  ❌  No UNDP data returned')

    # ── 4. UN World Population Prospects ─────────────────────
    print(f'\n[4/5] UN World Population Prospects')
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

    # ── 5. Climate ────────────────────────────────────────────
    print(f'\n[5/5] Open-Meteo Climate Archive (1991–2020 normals)')
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

    # ── Write output ──────────────────────────────────────────
    import os
    os.makedirs('dashboards/data', exist_ok=True)
    outfile = f'dashboards/data/{iso3.lower()}_data.json'
    with open(outfile, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False, default=str)

    # ── Summary ───────────────────────────────────────────────
    undp_count    = len(output['undp'])
    wpp_count     = len(output['un_wpp'])
    climate_ok    = output['climate'] is not None
    total_fetched = found_wb + found_imf + undp_count + wpp_count + (12 if climate_ok else 0)

    print(f'\n{"═"*56}')
    print(f'  Summary — {name}')
    print(f'  World Bank  : {found_wb}/{total_wb}')
    print(f'  IMF WEO     : {found_imf}/{total_imf}')
    print(f'  UNDP HDR    : {undp_count} indicators')
    print(f'  UN WPP      : {wpp_count} indicators')
    print(f'  Climate     : {"12 months ✅" if climate_ok else "failed ❌"}')
    print(f'  ─────────────────────────────────────────')
    print(f'  Total       : ~{total_fetched} data points fetched')
    print(f'  Output      : {outfile}')
    print(f'{"═"*56}\n')

if __name__ == '__main__':
    main()
