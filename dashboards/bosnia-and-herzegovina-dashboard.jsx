const { useState, useEffect } = React;

// ************************************************************
// DATA
// ************************************************************

// DATA STATE — every data item carries a `state` field:
//   2  = manually web-searched & verified by Claude — source cited in sub/note
//   1  = API / script fetched — World Bank, WGI, Open-Meteo, Wikidata (automated, sourced)
//   0  = not yet verified — placeholder, search not yet performed
//  -1  = NOT verified — training data / assumed / not cross-checked; annotate est.; unverified

// Uzbekistan flag: blue (#1EB4E5) top, white middle, green (#3DAA5C) bottom + red stripes, white crescent & 12 stars
const C = {
  bih:    '#002395', bihL: '#3355cc',  // primary — BiH blue (ISO 3166 Alpha-3)
  yel:    '#FCDD09', yelL: '#ffe84d',  // secondary — BiH gold
  blu:    '#2E86DE', bluL: '#5ba8ff',  // water / depth
  red:    '#E8192C', redL: '#ff3347',  // heat / record high
  bg:     '#000',
  card:   '#111',
  border: '#1e1e1e',
  track:  '#222',
  txt:    '#fff',
  sub:    '#999',
  muted:  '#888',
  faded:  '#555',
  sea:    '#1a3a5c',
  land:   '#1a1a1a',
  capital:'#FCDD09',
  flagRed:'#002395',
  bihS:   'rgba(0,35,149,.45)',
  dim:    '#444',
};


const fasvg = (vb, d) => <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} width="24" height="24" fill="#fff"><path d={d}/></svg>;

const icnGdp                 = fasvg('0 0 512 512', 'M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 400c0 44.2 35.8 80 80 80l400 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 416c-8.8 0-16-7.2-16-16L64 64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z');
const icnGdpCap              = fasvg('0 0 320 512', 'M160 0c17.7 0 32 14.3 32 32l0 35.7c1.6 .2 3.1 .4 4.7 .7c.4 .1 .7 .1 1.1 .2l48 8.8c17.4 3.2 28.9 19.9 25.7 37.2s-19.9 28.9-37.2 25.7l-47.5-8.7c-31.3-4.6-58.9-1.5-78.3 6.2s-27.2 18.3-29 28.1c-2 10.7-.5 16.7 1.2 20.4c1.8 3.9 5.5 8.3 12.8 13.2c16.3 10.7 41.3 17.7 73.7 26.3l2.9 .8c28.6 7.6 63.6 16.8 89.6 33.8c14.2 9.3 27.6 21.9 35.9 39.5c8.5 17.9 10.3 37.9 6.4 59.2c-6.9 38-33.1 63.4-65.6 76.7c-13.7 5.6-28.6 9.2-44.4 11l0 33.4c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-34.9c-.4-.1-.9-.1-1.3-.2l-.2 0s0 0 0 0c-24.4-3.8-64.5-14.3-91.5-26.3c-16.1-7.2-23.4-26.1-16.2-42.2s26.1-23.4 42.2-16.2c20.9 9.3 55.3 18.5 75.2 21.6c31.9 4.7 58.2 2 76-5.3c16.9-6.9 24.6-16.9 26.8-28.9c1.9-10.6 .4-16.7-1.3-20.4c-1.9-4-5.6-8.4-13-13.3c-16.4-10.7-41.5-17.7-74-26.3l-2.8-.7s0 0 0 0C119.4 279.3 84.4 270 58.4 253c-14.2-9.3-27.5-22-35.8-39.6c-8.4-17.9-10.1-37.9-6.1-59.2C23.7 116 52.3 91.2 84.8 78.3c13.3-5.3 27.9-8.9 43.2-11L128 32c0-17.7 14.3-32 32-32z');
const icnGdpGrowth           = fasvg('0 0 576 512', 'M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32l160 0c17.7 0 32 14.3 32 32l0 160c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-82.7L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160 384 160z');
const icnPop                 = fasvg('0 0 640 512', 'M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z');
const icnCurrency            = fasvg('0 0 576 512', 'M0 112.5L0 422.3c0 18 10.1 35 27 41.3c87 32.5 174 10.3 261-11.9c79.8-20.3 159.6-40.7 239.3-18.9c23 6.3 48.7-9.5 48.7-33.4l0-309.9c0-18-10.1-35-27-41.3C462 15.9 375 38.1 288 60.3C208.2 80.6 128.4 100.9 48.7 79.1C25.6 72.8 0 88.6 0 112.5zM288 352c-44.2 0-80-43-80-96s35.8-96 80-96s80 43 80 96s-35.8 96-80 96zM64 352c35.3 0 64 28.7 64 64l-64 0 0-64zm64-208c0 35.3-28.7 64-64 64l0-64 64 0zM512 304l0 64-64 0c0-35.3 28.7-64 64-64zM448 96l64 0 0 64c-35.3 0-64-28.7-64-64z');
const icnInflation           = fasvg('0 0 448 512', 'M0 80L0 229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7L48 32C21.5 32 0 53.5 0 80zm112 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z');
const icnUnemployment        = fasvg('0 0 576 512', 'M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-223.1L59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l58.3-97c17.4-28.9 48.6-46.6 82.3-46.6l29.7 0c33.7 0 64.9 17.7 82.3 46.6l44.9 74.7c-16.1 17.6-28.6 38.5-36.6 61.5c-1.9-1.8-3.5-3.9-4.9-6.3L232 256.9 232 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-128-16 0zM432 224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zm59.3 107.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L432 345.4l-36.7-36.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L409.4 368l-36.7 36.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L432 390.6l36.7 36.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L454.6 368l36.7-36.7z');
const icnLiteracy            = fasvg('0 0 576 512', 'M249.6 471.5c10.8 3.8 22.4-4.1 22.4-15.5l0-377.4c0-4.2-1.6-8.4-5-11C247.4 52 202.4 32 144 32C93.5 32 46.3 45.3 18.1 56.1C6.8 60.5 0 71.7 0 83.8L0 454.1c0 11.9 12.8 20.2 24.1 16.5C55.6 460.1 105.5 448 144 448c33.9 0 79 14 105.6 23.5zm76.8 0C353 462 398.1 448 432 448c38.5 0 88.4 12.1 119.9 22.6c11.3 3.8 24.1-4.6 24.1-16.5l0-370.3c0-12.1-6.8-23.3-18.1-27.6C529.7 45.3 482.5 32 432 32c-58.4 0-103.4 20-123 35.6c-3.3 2.6-5 6.8-5 11L304 456c0 11.4 11.7 19.3 22.4 15.5z');
const icnReligion            = fasvg('0 0 640 512', 'M351.2 4.8c3.2-2 6.6-3.3 10-4.1c4.7-1 9.6-.9 14.1 .1c7.7 1.8 14.8 6.5 19.4 13.6L514.6 194.2c8.8 13.1 13.4 28.6 13.4 44.4l0 73.5c0 6.9 4.4 13 10.9 15.2l79.2 26.4C631.2 358 640 370.2 640 384l0 96c0 9.9-4.6 19.3-12.5 25.4s-18.1 8.1-27.7 5.5L431 465.9c-56-14.9-95-65.7-95-123.7L336 224c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 8.8 7.2 16 16 16s16-7.2 16-16l0-84.9c0-7-1.8-13.8-5.3-19.8L340.3 48.1c-1.7-3-2.9-6.1-3.6-9.3c-1-4.7-1-9.6 .1-14.1c1.9-8 6.8-15.2 14.3-19.9zm-62.4 0c7.5 4.6 12.4 11.9 14.3 19.9c1.1 4.6 1.2 9.4 .1 14.1c-.7 3.2-1.9 6.3-3.6 9.3L213.3 199.3c-3.5 6-5.3 12.9-5.3 19.8l0 84.9c0 8.8 7.2 16 16 16s16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 118.2c0 58-39 108.7-95 123.7l-168.7 45c-9.6 2.6-19.9 .5-27.7-5.5S0 490 0 480l0-96c0-13.8 8.8-26 21.9-30.4l79.2-26.4c6.5-2.2 10.9-8.3 10.9-15.2l0-73.5c0-15.8 4.7-31.2 13.4-44.4L245.2 14.5c4.6-7.1 11.7-11.8 19.4-13.6c4.6-1.1 9.4-1.2 14.1-.1c3.5 .8 6.9 2.1 10 4.1z');
const icnLanguage            = fasvg('0 0 640 512', 'M0 128C0 92.7 28.7 64 64 64l192 0 48 0 16 0 256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64l-256 0-16 0-48 0L64 448c-35.3 0-64-28.7-64-64L0 128zm320 0l0 256 256 0 0-256-256 0zM178.3 175.9c-3.2-7.2-10.4-11.9-18.3-11.9s-15.1 4.7-18.3 11.9l-64 144c-4.5 10.1 .1 21.9 10.2 26.4s21.9-.1 26.4-10.2l8.9-20.1 73.6 0 8.9 20.1c4.5 10.1 16.3 14.6 26.4 10.2s14.6-16.3 10.2-26.4l-64-144zM160 233.2L179 276l-38 0 19-42.8zM448 164c11 0 20 9 20 20l0 4 44 0 16 0c11 0 20 9 20 20s-9 20-20 20l-2 0-1.6 4.5c-8.9 24.4-22.4 46.6-39.6 65.4c.9 .6 1.8 1.1 2.7 1.6l18.9 11.3c9.5 5.7 12.5 18 6.9 27.4s-18 12.5-27.4 6.9l-18.9-11.3c-4.5-2.7-8.8-5.5-13.1-8.5c-10.6 7.5-21.9 14-34 19.4l-3.6 1.6c-10.1 4.5-21.9-.1-26.4-10.2s.1-21.9 10.2-26.4l3.6-1.6c6.4-2.9 12.6-6.1 18.5-9.8l-12.2-12.2c-7.8-7.8-7.8-20.5 0-28.3s20.5-7.8 28.3 0l14.6 14.6 .5 .5c12.4-13.1 22.5-28.3 29.8-45L448 228l-72 0c-11 0-20-9-20-20s9-20 20-20l52 0 0-4c0-11 9-20 20-20z');
const icnLifeExp             = fasvg('0 0 512 512', 'M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4l87 0c22.6 0 43-13.6 51.7-34.5l10.5-25.2 49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3L320 253.7l1.7 3.4c9.5 19 28.9 31 50.1 31l104.5 0c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9zM503.7 240l-132 0c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8L205.9 158.2c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9L16 240c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9l0-5.8c0-69.9 50.5-129.5 119.4-141C165 36.5 211.4 51.4 244 84l12 12 12-12c32.6-32.6 79-47.5 124.6-39.9C461.5 55.6 512 115.2 512 185.1l0 5.8c0 16.9-2.8 33.5-8.3 49.1z');
const icnHdi                 = fasvg('0 0 512 512', 'M352 256c0 22.2-1.2 43.6-3.3 64l-185.3 0c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64l185.3 0c2.2 20.4 3.3 41.8 3.3 64zm28.8-64l123.1 0c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64l-123.1 0c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32l-116.7 0c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0l-176.6 0c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0L18.6 160C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192l123.1 0c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64L8.1 320C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6l176.6 0c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352l116.7 0zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6l116.7 0z');
const icnGovt                = fasvg('0 0 512 512', 'M240.1 4.2c9.8-5.6 21.9-5.6 31.8 0l171.8 98.1L448 104l0 .9 47.9 27.4c12.6 7.2 18.8 22 15.1 36s-16.4 23.8-30.9 23.8L32 192c-14.5 0-27.2-9.8-30.9-23.8s2.5-28.8 15.1-36L64 104.9l0-.9 4.4-1.6L240.1 4.2zM64 224l64 0 0 192 40 0 0-192 64 0 0 192 48 0 0-192 64 0 0 192 40 0 0-192 64 0 0 196.3c.6 .3 1.2 .7 1.8 1.1l48 32c11.7 7.8 17 22.4 12.9 35.9S494.1 512 480 512L32 512c-14.1 0-26.5-9.2-30.6-22.7s1.1-28.1 12.9-35.9l48-32c.6-.4 1.2-.7 1.8-1.1L64 224z');
const icnGas                 = fasvg('0 0 384 512', 'M372.5 256.5l-.7-1.9C337.8 160.8 282 76.5 209.1 8.5l-3.3-3C202.1 2 197.1 0 192 0s-10.1 2-13.8 5.5l-3.3 3C102 76.5 46.2 160.8 12.2 254.6l-.7 1.9C3.9 277.3 0 299.4 0 321.6C0 426.7 86.8 512 192 512s192-85.3 192-190.4c0-22.2-3.9-44.2-11.5-65.1zm-90.8 49.5c4.1 9.3 6.2 19.4 6.2 29.5c0 53-43 96.5-96 96.5s-96-43.5-96-96.5c0-10.1 2.1-20.3 6.2-29.5l1.9-4.3c15.8-35.4 37.9-67.7 65.3-95.1l8.9-8.9c3.6-3.6 8.5-5.6 13.6-5.6s10 2 13.6 5.6l8.9 8.9c27.4 27.4 49.6 59.7 65.3 95.1l1.9 4.3z');
const icnPeace               = fasvg('0 0 512 512', 'M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8s0 0 0 0z');
const icnArea                = fasvg('0 0 512 512', 'M352 256c0 22.2-1.2 43.6-3.3 64l-185.3 0c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64l185.3 0c2.2 20.4 3.3 41.8 3.3 64zm28.8-64l123.1 0c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64l-123.1 0c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32l-116.7 0c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0l-176.6 0c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0L18.6 160C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192l123.1 0c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64L8.1 320C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6l176.6 0c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352l116.7 0zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6l116.7 0z');

const TILES = [
  { grp:0, id:1,  state:1, label:'GDP',            value:'~$29.6B',          note:'World Bank 2024',                          icon:icnGdp },
  { grp:0, id:2,  state:1, label:'GDP per Capita', value:'~$9,400',          note:'World Bank 2024',                          icon:icnGdpCap },
  { grp:0, id:3,  state:1, label:'GDP Growth',     value:'+3.0%',            note:'World Bank 2024',                          icon:icnGdpGrowth },
  { grp:0, id:4,  state:1, label:'Population',     value:'~3.16M',           note:'World Bank 2024',                          icon:icnPop },
  { grp:0, id:5,  state:2, label:'Currency',       value:'BAM',              note:'Convertible Mark · €1 = 1.95583 BAM (fixed)', icon:icnCurrency },
  { grp:0, id:6,  state:1, label:'Inflation',      value:'1.7%',             note:'World Bank CPI 2024',                      icon:icnInflation },
  { grp:0, id:7,  state:1, label:'Unemployment',   value:'11.0%',            note:'ILO modelled 2025',                        icon:icnUnemployment},
  { grp:0, id:8,  state:1, label:'Literacy',       value:'97.0%',            note:'World Bank 2013 (most recent)',             icon:icnLiteracy},
  { grp:0, id:9,  state:2, label:'Religion',       value:'~51% Muslim',      note:'50.7% Muslim · 30.8% Orthodox · 15.2% Catholic (census 2013)', icon:icnReligion},
  { grp:0, id:10, state:2, label:'Language',       value:'Bosnian',          note:'Bosnian / Croatian / Serbian — all official', icon:icnLanguage},
  { grp:0, id:11, state:1, label:'Life Expectancy',value:'78.0 yrs',         note:'♀ 81.1 · ♂ 74.6 (World Bank 2024)',        icon:icnLifeExp},
  { grp:0, id:12, state:2, label:'HDI',            value:'0.804',            note:'Rank 74 · High human development (UNDP HDR 2025)', icon:icnHdi },
  { grp:0, id:13, state:2, label:'Government',     value:'Parliamentary',    note:'Federal republic · Dayton tripartite presidency', icon:icnGovt},
  { grp:0, id:14, state:2, label:'Hydropower',     value:'2,129 MW',         note:'Over 50% of electricity; major rivers: Neretva, Drina, Sava', icon:icnGas},
  { grp:0, id:15, state:1, label:'Peace Index',    value:'GPI 1.810',        note:'Rank 48/163 · IEP GPI 2026',               icon:icnPeace},
  { grp:0, id:16, state:1, label:'Area',           value:'51,210 km²',       note:'Landlocked (except 20 km Adriatic coast) · World Bank', icon:icnArea},
];

/* ── §1 GEOGRAPHY ── */

const GEO = [
  { grp:1, id:1,  state:1, label:'Total Area',        value:'51,210 km²',      sub:'World Bank · slightly larger than Slovakia; 127th globally',              accent:C.dim, delay:0.05 },
  { grp:1, id:2,  state:1, label:'Highest Peak',      value:'Maglić 2,386 m',  sub:'On the Montenegro border; Dinaric Alps (Wikidata)',                       accent:C.bih, delay:0.10 },
  { grp:1, id:3,  state:1, label:'Lowest Point',      value:'Adriatic Sea 0 m',sub:'Neum coastline — BiH\'s only sea outlet (Wikidata)',                      accent:C.blu, delay:0.15 },
  { grp:1, id:4,  state:2, label:'Borders',           value:'3 countries',     sub:'Croatia 932 km · Serbia 357 km · Montenegro 249 km (CIA World Factbook)', accent:C.dim, delay:0.20 },
  { grp:1, id:5,  state:2, label:'Adriatic Outlet',   value:'20 km coastline', sub:'Neum — 2nd shortest national coastline globally after Monaco (Wikipedia)',accent:C.dim, delay:0.25 },
  { grp:1, id:6,  state:2, label:'Dinaric Alps',      value:'~67% mountainous',sub:'Hills & mountains dominate; peaks to 2,386 m; dense forest cover (WorldAtlas)', accent:C.dim, delay:0.30 },
  { grp:1, id:7,  state:2, label:'Neretva River',     value:'225 km',          sub:'208 km in BiH; flows south through Mostar to Adriatic (Britannica)',      accent:C.dim, delay:0.35 },
  { grp:1, id:8,  state:2, label:'Karst Terrain',     value:'South Herzegovina',sub:'Limestone plateaus, caves, sinkholes, underground drainage (Wikipedia)', accent:C.dim, delay:0.40 },
  { grp:1, id:9,  state:1, label:'Arable land',       value:'7.2%',            sub:'Concentrated in Sava valley (Posavina) north; World Bank 2023',           accent:C.dim, delay:0.45 },
];

const GEO_TERRAIN = {
  title: 'Major Terrain Zones',
  data: [
  { grp:1, id:10, state:2, label:"Mountains & highlands (Dinaric Alps)", value:"~67%", pct:100, color:C.bih },
  { grp:1, id:11, state:1, label:"Forest cover",                         value:"~43%", pct:64,  color:C.yel },
  { grp:1, id:12, state:2, label:"Karst plateau (south Herzegovina)",    value:"~20%", pct:30,  color:C.dim },
  { grp:1, id:13, state:2, label:"Northern plains (Posavina / Sava)",    value:"~10%", pct:15,  color:C.dim },
  { grp:1, id:14, state:1, label:"Arable land",                          value:"7.2%", pct:11,  color:C.dim },
],
  note: 'Bosnia and Herzegovina is among Europe\'s most rugged and forested countries. Two-thirds is mountainous Dinaric Alps; almost half is forested. The sharp contrast between the densely forested Bosnian highlands and the dry limestone karst of Herzegovina defines the country\'s dual character — visible even in its name. Forest data: World Bank 2023; terrain estimates: Wikipedia / WorldAtlas.'
};

const GEO_WATER = {
  title: 'Key Rivers & Water Features',
  data: [
  { grp:1, id:15, state:2, label:'Neretva River',              value:'225 km total; 208 km in BiH — drains south to Adriatic through Mostar (Britannica)' },
  { grp:1, id:16, state:2, label:'Sava River — northern border',value:'944 km total; 345 km forms the BiH–Croatia border; Danube tributary (Britannica)' },
  { grp:1, id:17, state:2, label:'Drina River — eastern border',value:'346 km; forms most of the BiH–Serbia border; longest karst river in Dinaric Alps (Wikipedia)' },
  { grp:1, id:18, state:2, label:'Una River (northwest)',       value:'212 km; partial border with Croatia; renowned for pristine gorges and rapids (Wikipedia)' },
  { grp:1, id:19, state:2, label:'Pliva Lakes — Jajce',         value:'Two natural tufa lakes (Veliko & Malo Plivsko); emerald waters; iconic 20 m Pliva waterfall (Wikipedia)' },
  { grp:1, id:20, state:2, label:'Neum — Adriatic outlet',      value:'Only 20 km of coastline; BiH\'s sole sea access; town of Neum entirely enclosed by Croatia (Wikipedia)' },
],
  note: 'BiH\'s rivers flow in two directions: the Neretva drains south to the Adriatic (serving only ~20% of territory), while the Sava, Drina, Una, and Vrbas drain north to the Danube. This hydrological divide mirrors the cultural contrast between Mediterranean Herzegovina and the continental Bosnian interior.'
};

const GEO_REGIONS = [
  { grp:1, id:21, state:2, name:"Federation of BiH (FBiH)",  type:"Entity · Bosniak-Croat", desc:"51% of territory; ~2.2M population (2013 census); 10 cantons; capital Sarajevo. Predominantly Bosniak and Croat (Dayton Agreement 1995).", stripe:C.bih },
  { grp:1, id:22, state:2, name:"Republika Srpska (RS)",      type:"Entity · Bosnian Serb",  desc:"49% of territory; ~1.2M population; capital Banja Luka. Predominantly Bosnian Serb. Established by Dayton Agreement 1995.", stripe:C.yel },
  { grp:1, id:23, state:2, name:"Brčko District",             type:"Self-governing district", desc:"~93 km² in northeast BiH; ~93,000 population; under international supervision; formally shared between both entities since 1999.", stripe:C.dim },
  { grp:1, id:24, state:2, name:"Herzegovina (subregion)",    type:"Geographic · cultural",   desc:"Southwest BiH; dry Mediterranean character; karst terrain; Mostar as cultural hub; known for wine, sun, and the Old Bridge (UNESCO).", stripe:C.blu },
];

/* ── §2 CLIMATE ── */
const CLIMA_KPI = [
  { grp:2, id:1, state:1, label:"Avg Annual Temp (Sarajevo)", value:"10.5°C",    sub:"Temperate continental; warm summers, cold winters (Open-Meteo 1991–2020)",                   accent:C.dim, delay:0.05 },
  { grp:2, id:2, state:2, label:"Record High",                value:"43.1°C",    sub:"Recorded 2007; heatwaves increasing under climate change (plantmaps.com)",                    accent:C.red, delay:0.10 },
  { grp:2, id:3, state:2, label:"Record Low",                 value:"−29°C",     sub:"January 1963; mountain valleys experience extreme cold (easeweather.com)",                    accent:C.blu, delay:0.15 },
  { grp:2, id:4, state:1, label:"Annual Rainfall (Sarajevo)", value:"1,118 mm",  sub:"Rain year-round; no dry season; May–Jun wettest (Open-Meteo 1991–2020)",                    accent:C.dim, delay:0.20 },
  { grp:2, id:5, state:2, label:"Climate type",               value:"Cfb / Dfb", sub:"Oceanic dominant (Cfb); continental upland (Dfb); Mediterranean SW (Csa) (Wikipedia)",       accent:C.dim, delay:0.25 },
  { grp:2, id:6, state:1, label:"Summer Jun–Aug avg",         value:"19.8°C",    sub:"Pleasant; July peak ~22°C; thunderstorms common (Open-Meteo Jun–Aug avg)",                   accent:C.dim, delay:0.30 },
  { grp:2, id:7, state:1, label:"Winter Dec–Feb avg",         value:"1.0°C",     sub:"Snow regular in Sarajevo; mountains −10 to −20°C; Herzegovina milder (Open-Meteo)",          accent:C.dim, delay:0.35 },
  { grp:2, id:8, state:2, label:"Mostar (Herzegovina) avg",   value:"12.1°C",    sub:"Mediterranean character; ~1,500 mm rain; hot dry summers; milder winters (climate-data.org)",accent:C.dim, delay:0.40 },
  { grp:2, id:9, state:1, label:"Spring Mar–May avg",         value:"9.7°C",     sub:"Snowmelt; May wettest month ~117mm; lush greenery (Open-Meteo Mar–May avg)",                accent:C.dim, delay:0.45 },
];

const CLIMA_DAYLIGHT = {
  title: 'Daylight Hours — Sarajevo (43.9°N)',
  data: [
  { grp:2, id:10, state:1, mo:'Jan', label:'9h 12m',    pct:60,  color:C.blu },
  { grp:2, id:11, state:1, mo:'Feb', label:'10h 30m',   pct:69  },
  { grp:2, id:12, state:1, mo:'Mar', label:'11h 54m',   pct:78  },
  { grp:2, id:13, state:1, mo:'Apr', label:'13h 30m',   pct:88  },
  { grp:2, id:14, state:1, mo:'May', label:'14h 48m',   pct:97  },
  { grp:2, id:15, state:1, mo:'Jun', label:'15h 18m ★', pct:100, color:C.bih, dark:true },
  { grp:2, id:16, state:1, mo:'Jul', label:'14h 48m',   pct:97  },
  { grp:2, id:17, state:1, mo:'Aug', label:'13h 30m',   pct:88  },
  { grp:2, id:18, state:1, mo:'Sep', label:'12h 00m',   pct:78  },
  { grp:2, id:19, state:1, mo:'Oct', label:'10h 30m',   pct:69  },
  { grp:2, id:20, state:1, mo:'Nov', label:'9h 12m',    pct:60,  color:C.blu },
  { grp:2, id:21, state:1, mo:'Dec', label:'8h 42m ★',  pct:57,  color:C.blu },
],
  note: <>★ Summer solstice <strong style={{ color:C.bihL }}>15h 18m</strong> · Winter solstice <strong style={{ color:C.bluL }}>8h 42m</strong> · <em>Daylight values for Sarajevo (43.9°N) · timeanddate.com</em><br/>Bosnia and Herzegovina has a moderate seasonal daylight range. Sarajevo enjoys long summer evenings while winters are shorter than further north. The sunnier Mediterranean Herzegovina (Mostar) sees 2,700+ sunshine hours per year compared to Sarajevo&#39;s ~2,000 — a sharp contrast within a small country.</>
};

const CLIMA_RAIN_REGIONAL = {
  title: 'Rainfall by Region',
  sublabel: 'Annual precipitation by zone',
  data: [
  { grp:2, id:22, state:2, label:"Herzegovina / Mostar (Mediterranean)",  value:"~1,500 mm", pct:100, color:C.bih },
  { grp:2, id:23, state:1, label:"Central Bosnia / Sarajevo",             value:"1,118 mm",  pct:75,  color:C.yel },
  { grp:2, id:24, state:-1, label:"Northwest / Una valley (est.; unverified)", value:"~1,200 mm", pct:80, color:C.dim },
  { grp:2, id:25, state:-1, label:"Northern plains / Posavina (est.; unverified)", value:"~850 mm", pct:57, color:C.dim },
  { grp:2, id:26, state:-1, label:"Eastern plateau / Drina valley (est.; unverified)", value:"~700 mm", pct:47, color:C.dim },
]
};

const tempColor = p => {
  if (p < 25) return `rgb(${Math.round(40+p*0.8)},${Math.round(60+p*0.4)},${Math.round(180-p*0.8)})`;
  if (p < 50) { const t=(p-25)/25; return `rgb(${Math.round(60+t*130)},${Math.round(80+t*80)},${Math.round(160-t*100)})`; }
  if (p < 75) { const t=(p-50)/25; return `rgb(${Math.round(190+t*50)},${Math.round(160-t*80)},${Math.round(60-t*40)})`; }
  const t=(p-75)/25; return `rgb(${Math.round(240-t*30)},${Math.round(80-t*60)},${Math.round(20)})`;
};

const rainColor = p => `rgb(${Math.round(153-107*p/100)},${Math.round(153-19*p/100)},${Math.round(153+69*p/100)})`;

const CLIMA_RAIN_SEASONAL = {
  sublabel: 'Sarajevo seasonal pattern',
  data: [
  { grp:2, id:27, state:2, label:"May (wettest month)",       value:"~117 mm", pct:100, color:C.bih },
  { grp:2, id:28, state:2, label:"August (driest month)",     value:"~78 mm",  pct:67,  color:C.dim },
  { grp:2, id:29, state:2, label:"Dec–Jan (snow season)",     value:"~80 mm",  pct:68,  color:C.blu },
],
  gradbar1: { title:'Monthly avg temperature — Sarajevo (°C)', values:[0,2,6,11,15,19,22,22,16,11,5,1], colorStops:tempColor, unit:'°' },
  gradbar2: { title:'Monthly rainfall — Sarajevo (mm)', values:[80,75,85,105,117,98,82,78,95,90,105,88], colorStops:rainColor, unit:'mm' },
  note: "Sarajevo receives precipitation year-round with no dry season — unlike the semi-arid interior of Central Asia. The wettest period is late spring (May ~117 mm) driven by continental moisture from the north. Herzegovina (Mostar) is an exception: it has hot, dry summers due to Mediterranean influence but receives even more total annual rainfall (~1,500 mm) from autumn and winter storms off the Adriatic. Climate data: Open-Meteo 1991–2020 normals; monthly distribution from climate-data.org."
};

/* ── §3 POPULATION ── */
const POP_KPI = [
  { grp:3, id:1,  state:1, label:"Population (2024)",   value:"~3.16M",      sub:"3,164,253 — one of Europe's fastest-shrinking nations (World Bank 2024)", accent:C.bih, delay:0.05 },
  { grp:3, id:2,  state:1, label:"Urban Population",    value:"52.1%",        sub:"Urbanisation growing; Sarajevo metro >500k incl. suburbs (World Bank 2024)", accent:C.dim, delay:0.10 },
  { grp:3, id:3,  state:2, label:"Median Age",          value:"~45.3 yrs",    sub:"Rank 8/196 oldest globally; 22.2% aged 65+ (Worldometer 2024)",          accent:C.yel, delay:0.15 },
  { grp:3, id:4,  state:1, label:"Population Density",  value:"62.2 /km²",    sub:"Unevenly distributed; Sarajevo canton far denser (World Bank 2023)",      accent:C.dim, delay:0.20 },
  { grp:3, id:5,  state:1, label:"Life Expectancy",     value:"78.0 yrs",     sub:"♀ 81.1 · ♂ 74.6 — above regional average (World Bank 2024)",             accent:C.dim, delay:0.25 },
  { grp:3, id:6,  state:1, label:"Fertility Rate",      value:"1.49",         sub:"Well below replacement (2.1); key driver of population decline (World Bank 2024)", accent:C.dim, delay:0.30 },
];

const POP_GROWTH = {
  title: 'Population Decline',
  data: [
  { grp:3, id:7,  state:2,  label:"1991 (pre-war peak)",  value:"4.37M",  pct:100, color:C.bih },
  { grp:3, id:8,  state:-1, label:"2000 (est.; unverified)", value:"~3.87M", pct:89, color:C.dim },
  { grp:3, id:9,  state:2,  label:"2013 (census)",         value:"3.53M",  pct:81,  color:C.dim },
  { grp:3, id:10, state:2,  label:"2020",                  value:"3.30M",  pct:76,  color:C.dim },
  { grp:3, id:11, state:1,  label:"2024",                  value:"3.16M",  pct:72,  color:C.yel },
],
  note: "BiH is one of Europe's most dramatic demographic contractions. The 1992-95 war killed ~100,000 and displaced 2.2 million. Population has never recovered — emigration to the EU accelerated after 2014 and continues. At current trend, BiH could fall below 3M before 2030. Census data: Agency for Statistics of BiH 2013; recent: World Bank / macrotrends."
};

const POP_CITIES = {
  title: 'Largest Cities (Wikidata est.)',
  data: [
  { grp:3, id:12, state:1, label:"Sarajevo (capital)",        value:"275,524",  pct:100, color:C.bih },
  { grp:3, id:13, state:1, label:"Banja Luka (RS capital)",   value:"185,042",  pct:67,  color:C.yel },
  { grp:3, id:14, state:1, label:"Tuzla",                     value:"110,979",  pct:40,  color:C.blu },
  { grp:3, id:15, state:1, label:"Prijedor",                  value:"89,397",   pct:32,  color:C.dim },
  { grp:3, id:16, state:1, label:"Zenica",                    value:"70,553",   pct:26,  color:C.dim },
],
  note: "City populations from 2013 census / Wikidata; BiH has not conducted a new census since 2013. Sarajevo metropolitan area exceeds 500,000 including suburbs. The war dramatically reshaped urban demographics — Sarajevo lost most of its Serb population while Banja Luka lost most Bosniaks and Croats."
};

const POP_ETHNIC = {
  title: 'Ethnic Composition (2013 census)',
  data: [
  { grp:3, id:17, state:2, label:'Bosniak',          value:'50.1%', pct:100, color:C.bih },
  { grp:3, id:18, state:2, label:'Bosnian Serb',     value:'30.8%', pct:61,  color:C.yel },
  { grp:3, id:19, state:2, label:'Bosnian Croat',    value:'15.4%', pct:31,  color:C.blu },
  { grp:3, id:20, state:2, label:'Others',           value:'2.7%',  pct:5,   color:C.dim },
  { grp:3, id:21, state:-1, label:'Diaspora (est.; unverified — IOM)', value:'~1.0–1.5M abroad', pct:0, color:C.dim },
],
  label: '3.16M',
  sublabel: 'population (World Bank 2024)',
  note: "Ethnic structure is defined by Dayton (1995), which institutionalised three constituent peoples. Citizens of other ethnicities (Jews, Roma — the \"Others\") are constitutionally excluded from the tripartite presidency — ruled discriminatory by the European Court of Human Rights in Sejdic and Finci v. BiH (2009). Source: Agency for Statistics of Bosnia and Herzegovina, 2013 census."
};

const POP_RELIGION = {
  title: 'Religion & Language',
  data: [
  { grp:3, id:22, state:2, label:'Islam (Sunni Hanafi)',      value:'50.7%' },
  { grp:3, id:23, state:2, label:'Eastern Orthodox',          value:'30.7%' },
  { grp:3, id:24, state:2, label:'Roman Catholic',            value:'15.2%' },
  { grp:3, id:25, state:2, label:'Other / undeclared',        value:'3.4%' },
  { grp:3, id:26, state:2, label:'Official languages',        value:'Bosnian · Croatian · Serbian (all 3 co-official)' },
  { grp:3, id:27, state:2, label:'Official scripts',          value:'Latin and Cyrillic — both constitutionally recognised' },
  { grp:3, id:28, state:2, label:'UNESCO World Heritage',     value:'Old Bridge Mostar (2005) · Mehmed Pasa Bridge (2007) · Stecci (2016)' },
],
  note: "Religion in BiH closely follows ethnic lines: Bosniaks are predominantly Sunni Muslim, Bosnian Serbs are Serbian Orthodox, Bosnian Croats are Roman Catholic. Religious identity became a marker of ethnicity during the 1992-95 war. Inter-faith relations have improved but remain politically sensitive. Census 2013: Agency for Statistics of BiH / Wikipedia / U.S. State Dept."
};

/* ── §4 ECONOMY ── */
const ECON_KPI = [
  { grp:4, id:1, state:2, label:"GDP Nominal (2024)",      value:"~$28B",       sub:"IMF WEO Oct 2024; upper-middle income threshold; EU candidate since 2022", accent:C.bih, delay:0.05 },
  { grp:4, id:2, state:2, label:"GDP per Capita (2024)",   value:"~$8,221",     sub:"~1/3 of EU average; slow convergence (3% real growth/yr since 2015)",      accent:C.dim, delay:0.10 },
  { grp:4, id:3, state:1, label:"GDP Growth (2024)",       value:"3.0%",        sub:"Steady; services and construction-led; below EU accession peer avg (World Bank)", accent:C.yel, delay:0.15 },
  { grp:4, id:4, state:2, label:"GDP PPP per capita (2024)",value:"~$22,700",   sub:"Total PPP ~$74B — significantly above nominal; IMF WEO Oct 2024",         accent:C.dim, delay:0.20 },
  { grp:4, id:5, state:1, label:"Inflation CPI",           value:"3.1%",        sub:"Falling from 14% peak in 2022; stabilising around 3% (World Bank 2024)",  accent:C.dim, delay:0.25 },
  { grp:4, id:6, state:2, label:"Currency",                value:"BAM (pegged)", sub:"1 EUR = 1.95583 BAM — fixed rate since 1997; managed by BiH Currency Board", accent:C.dim, delay:0.30 },
];

const ECON_GDP_DONUT = {
  title: 'GDP by Sector & Major Exports',
  label: '$28B',
  sublabel: 'GDP 2024',
  data: [
  { grp:4, id:7, state:2, label:'Services (trade, finance, tourism, public)', value:'~54%', pct:54, color:C.bih },
  { grp:4, id:8, state:2, label:'Industry (manufacturing, construction)',      value:'~25%', pct:25, color:C.yel },
  { grp:4, id:9, state:2, label:'Agriculture (livestock, crops, forestry)',    value:'~5%',  pct:5,  color:C.blu },
]
};

const ECON_EXPORTS_BARS = {
  data: [
  { grp:4, id:10, state:2,  label:"Metals (iron/steel structures, aluminum)", value:"~18% of exports (~$1.6B)", pct:100, color:C.bih },
  { grp:4, id:11, state:2,  label:"Electrical machinery & insulated wire",    value:"~13%",                     pct:72,  color:C.yel },
  { grp:4, id:12, state:-1, label:"Wood products & furniture (est.; unverified)", value:"~10%",                pct:56,  color:C.blu },
  { grp:4, id:13, state:-1, label:"Electricity (hydropower surplus, est.; unverified)", value:"~9%",           pct:50,  color:C.dim },
],
  note: "Total exports $8.9B in 2024 (-3.6% YoY); EU absorbs 74% ($6.5B) — Germany, Croatia, Serbia are top partners. BiH is structurally import-heavy: imports ~$15B vs exports $8.9B, leaving a ~$6B trade deficit. Remittances (~10.5% of GDP) are critical in bridging the gap. Source: worldstopexports.com 2024; Halal Expo Sarajevo trade data."
};

const ECON_INDICATORS = {
  title: 'Key Economic Indicators',
  data: [
  { grp:4, id:14, state:2, label:'Remittances (2023)', value:'~10.5% of GDP (~$2.9B) — one of Europe\'s highest rates; U.S. State Dept cites up to 15%' },
  { grp:4, id:15, state:2, label:'Trade balance (2024)', value:'Exports $8.9B / Imports ~$15B — deficit ~$6B; structural imbalance persists' },
  { grp:4, id:16, state:2, label:'External debt', value:'~15.6% of GNI (2024) — low by regional standards (World Bank / tradingeconomics)' },
  { grp:4, id:17, state:2, label:'EU trade share', value:'74% of all exports go to EU; Germany, Croatia, Serbia top 3 partners (2024)' },
  { grp:4, id:18, state:2, label:'Poverty rate (national line)', value:'17.5% in 2021 — 40% of adults cannot cover expenses >1 month (World Bank)' },
  { grp:4, id:19, state:2, label:'Income vs EU average', value:'~1/3 of EU per capita — avg real income growth only 3%/yr since 2015; gap closing slowly' },
],
  note: "BiH's economy is characterised by a large public sector, remittance dependence, and a structural trade deficit. Growth averages 3% — enough to prevent crisis, not enough for rapid EU convergence. The EUR-pegged BAM provides monetary stability but removes exchange rate flexibility. Key structural risks: political deadlock blocking reforms, brain drain to the EU, and over-reliance on metal exports that face EU carbon border adjustment."
};

/* ── §5 EMPLOYMENT ── */
const EMP_KPI = [
  { grp:5, id:1, state:2, label:"Avg Monthly Wage (2024)",  value:"2,020 BAM gross", sub:"~€1,030/month; significant variation by sector and entity (talentup.io / CEIC 2024)", accent:C.bih, delay:0.05 },
  { grp:5, id:2, state:-1, label:"Labour Force (est.; no official registry; ILO modelled)", value:"~1.0M", sub:"Derived: employment rate 44.7% of ~2.05M working-age pop + 10.7% unemployment", accent:C.dim, delay:0.10 },
  { grp:5, id:3, state:2, label:"Unemployment (2024)",      value:"10.7%",          sub:"ILO modelled estimate 2024; structural unemployment worsened by emigration (ILOSTAT)", accent:C.dim, delay:0.15 },
  { grp:5, id:4, state:2, label:"Youth Unemployment (15–24)", value:"~32%",         sub:"ILO 2022; one of Europe's highest; primary driver of youth emigration to EU",          accent:C.red, delay:0.20 },
  { grp:5, id:5, state:2, label:"Minimum Wage (2024)",      value:"596 BAM gross",  sub:"~€304/month — among the lowest in Europe; unchanged 2023–2024 (countryeconomy.com)",   accent:C.dim, delay:0.25 },
  { grp:5, id:6, state:2, label:"Employment Rate",          value:"44.7%",          sub:"% of working age (15–64) in employment — low due to emigration and informality (ILO 2022)", accent:C.dim, delay:0.30 },
];

const EMP_WAGES = {
  title: 'Wages by Sector (monthly BAM, 2024 est.)',
  data: [
  { grp:5, id:7,  state:-1, label:"IT & professional services (est.; unverified — no official BiH sectoral data)", value:"~3,500 BAM", pct:100, color:C.bih },
  { grp:5, id:8,  state:-1, label:"Banking & financial services (est.; unverified)",                               value:"~3,000 BAM", pct:86,  color:C.yel },
  { grp:5, id:9,  state:2,  label:"National average (2024)",                                                       value:"2,020 BAM",  pct:58,  color:C.dim },
  { grp:5, id:10, state:-1, label:"Public administration (est.; unverified)",                                      value:"~1,800 BAM", pct:51,  color:C.blu },
  { grp:5, id:11, state:-1, label:"Education & health (est.; unverified)",                                         value:"~1,400 BAM", pct:40,  color:C.dim },
  { grp:5, id:12, state:-1, label:"Agriculture (est.; unverified — includes informal)",                            value:"~1,000 BAM", pct:29,  color:C.dim },
],
  note: "BiH publishes national average wages but not consistent sectoral breakdowns. IT and professional services in Sarajevo command well above average; agriculture — employing ~17% of the labour force — earns near or below the 596 BAM minimum. The 3.5× top-to-bottom wage gap explains sectoral emigration: young IT graduates often move to EU rather than stay for local wages."
};

const EMP_SECTORS_DONUT = {
  title: 'Employment by Sector',
  label: '~1.0M',
  sublabel: 'est. labour force (ILO modelled)',
  data: [
  { grp:5, id:13, state:2, label:'Services (trade, finance, tourism, public)', value:'~50%', pct:50, color:C.bih },
  { grp:5, id:14, state:2, label:'Industry (manufacturing, energy, mining)',   value:'~33%', pct:33, color:C.yel },
  { grp:5, id:15, state:2, label:'Agriculture (crops, livestock, forestry)',   value:'~17%', pct:17, color:C.blu },
]
};

const EMP_MIGRATION = {
  data: [
  { grp:5, id:16, state:-1, label:'Diaspora workers abroad (est.; no official registry; ILO modelled)', value:'hundreds of thousands — primarily DE, AT, SI, HR' },
  { grp:5, id:17, state:2,  label:'Remittances (2023)', value:'~10.5% of GDP (~$2.9B) — U.S. State Dept cites up to 15%; World Bank 2023' },
  { grp:5, id:18, state:-1, label:'Brain drain (est.; unverified — no official exit data)', value:'~30%+ of emigrants are university graduates; accelerating since 2014' },
],
  note: "BiH faces a structural emigration trap: low wages + political dysfunction + EU free movement = continuous outflow. Remittances (~10.5% of GDP) sustain consumption but mask the underlying hollowing-out of the working-age population. Youth unemployment at ~32% makes the emigration pull nearly impossible to counter without fundamental wage and governance reform."
};

/* ── §6 EDUCATION ── */
const EDU_KPI = [
  { grp:6, id:1, state:1, label:"Literacy Rate",        value:"98.3%",    sub:"Adult literacy (15+); macrotrends / World Bank 2022",                                  accent:C.bih, delay:0.05 },
  { grp:6, id:2, state:2, label:"HDI (2022)",           value:"0.779",    sub:"High Human Development — rank 80/193 globally (UNDP HDR 2024)",                           accent:C.dim, delay:0.10 },
  { grp:6, id:3, state:2, label:"Avg Years Schooling",  value:"10.54 yrs",sub:"Increased 4.42 yrs since 2000; worlddata.info / UNDP",                                   accent:C.dim, delay:0.15 },
  { grp:6, id:4, state:-1, label:"Expected Schooling (est.; unverified — UNDP value not retrieved)", value:"~13–14 yrs", sub:"est.; unverified",                          accent:C.dim, delay:0.20 },
  { grp:6, id:5, state:1, label:"Education Spending",   value:"~4% GDP",  sub:"Public expenditure on education; World Bank 2022",                                        accent:C.dim, delay:0.25 },
  { grp:6, id:6, state:2, label:"Tertiary Enrolment",   value:"45.0%",    sub:"Gross tertiary enrolment 2023; female-to-male ratio 1.4 (World Bank / theglobaleconomy)", accent:C.dim, delay:0.30 },
];

const EDU_METRICS = {
  title: 'Education Metrics',
  data: [
  { grp:6, id:7,  state:-1, label:"Primary enrolment (est.; unverified — no 2024 BiH figure retrieved)", value:"~90%+", pct:90, color:C.bih },
  { grp:6, id:8,  state:2,  label:"Secondary enrolment (historical avg 2007–2023)",                      value:"~85%",  pct:85, color:C.yel },
  { grp:6, id:9,  state:2,  label:"Tertiary enrolment (World Bank / theglobaleconomy 2023)",             value:"45.0%", pct:45, color:C.blu },
  { grp:6, id:10, state:2,  label:"Female:male tertiary ratio (World Bank 2023)",                        value:"1.40",  pct:70, color:C.dim },
  { grp:6, id:11, state:2,  label:"PISA participation",                                                  value:"Does not participate", pct:0, color:C.dim },
],
  note: "BiH has high female tertiary participation (1.4× male rate) yet faces a brain drain paradox — graduates emigrate at high rates. BiH does not participate in PISA, making international quality comparisons difficult. The education system is fragmented: 14 cantonal education ministries in FBiH + Republika Srpska + Brcko District, each with separate curricula — widely seen as a structural obstacle to quality."
};

const EDU_FACTS = {
  title: 'Key Education Facts',
  data: [
  { grp:6, id:12, state:2, label:'Official languages of instruction', value:'Bosnian, Croatian, Serbian — all 3 used in schools depending on entity/canton' },
  { grp:6, id:13, state:2, label:'Scripts', value:'Latin and Cyrillic — both official; Latin dominant in FBiH, Cyrillic in RS' },
  { grp:6, id:14, state:2, label:'University system', value:'8 public universities + several private; Sarajevo (est. 1949) is oldest and largest' },
  { grp:6, id:15, state:2, label:'Education governance', value:'14 cantonal ministries (FBiH) + RS ministry + Brcko — 16 separate curricula' },
  { grp:6, id:16, state:2, label:'Higher education reform', value:'Bologna Process adopted 2003; EU-aligned degree structure (BA/MA/PhD)' },
  { grp:6, id:17, state:2, label:'Brain drain', value:'Majority of graduates consider emigration; IT, medicine, engineering most affected' },
],
  note: "BiH's education system is among Europe's most fragmented — a direct legacy of Dayton. Ethnic segregation in schools (\"two schools under one roof\") remains in ~50 communities in FBiH, where Bosniak and Croat children attend the same building but follow separate curricula. Ruled discriminatory by the Constitutional Court of BiH but largely unreformed as of 2024."
};

/* ── §7 POLITICAL ── */
const POL_KPI = [
  { grp:7, id:1, state:2, label:"System",           value:"Parliamentary republic", sub:"Highly decentralised; constitutional framework embedded in Dayton Peace Agreement (1995)", accent:C.dim, delay:0.05 },
  { grp:7, id:2, state:2, label:"Presidency",       value:"Tripartite (rotating)",  sub:"1 Bosniak · 1 Serb · 1 Croat; chair rotates every 8 months; current chair: Z. Cvijanovic (Serb, since Nov 2024)", accent:C.dim, delay:0.10 },
  { grp:7, id:3, state:2, label:"Parliament",       value:"42-seat House of Rep.",  sub:"Bicameral; 28 seats FBiH + 14 RS; House of Peoples (upper) has 15 seats", accent:C.dim, delay:0.15 },
  { grp:7, id:4, state:2, label:"Next Election",    value:"2026",                   sub:"General elections held every 4 years; last Oct 2022 (Wikipedia / eeas.europa.eu)", accent:C.dim, delay:0.20 },
  { grp:7, id:5, state:2, label:"Corruption (CPI)", value:"33/100 — rank 109/180",  sub:"Transparency International CPI 2024; historic low — worst score to date", accent:C.red, delay:0.25 },
  { grp:7, id:6, state:2, label:"EU Status",        value:"Candidate (Dec 2022)",   sub:"Accession negotiations opened Mar 2024 (European Council decision)", accent:C.yel, delay:0.30 },
];

const POL_ELECTION = {
  title: '2022 General Election (House of Representatives)',
  data: [
  { grp:7, id:7, state:2, label:"Party of Democratic Action — SDA (Bosniak)", value:"~17%", pct:100, color:C.bih },
  { grp:7, id:8, state:2, label:"Alliance of Independent Social Democrats — SNSD (Serb)", value:"~16%", pct:94, color:C.yel },
  { grp:7, id:9, state:2, label:"Croatian Democratic Union — HDZ BiH (Croat)", value:"~9%", pct:53, color:C.blu },
  { grp:7, id:10, state:2, label:"Other parties (fragmented field)", value:"~58% combined", pct:0, color:C.dim },
],
  note: "BiH elections are ethnically structured — parties compete primarily within their constituent people. Dodik's SNSD controls RS; SDA and rivals compete in FBiH. The 2022 elections were marked by allegations of fraud and continued Dodik-led secessionist rhetoric. No single government can form without inter-ethnic coalition agreement — a process that typically takes months."
};

const POL_TIMELINE = {
  title: 'Political Timeline',
  data: [
  { grp:7, id:11, state:2, yr:'1992', tx:"BiH declares independence Apr 5. Bosnian War begins — Serb forces besiege Sarajevo and launch ethnic cleansing campaigns." },
  { grp:7, id:12, state:2, yr:'1994', tx:"Washington Agreement creates the Federation of BiH (Bosniaks + Croats). Sarajevo siege continues for 1,425 days — longest in modern history." },
  { grp:7, id:13, state:2, yr:'1995', tx:"Srebrenica massacre (Jul) — 8,000+ Bosniaks killed; ruled genocide by ICTY. Dayton Peace Agreement signed Dec 14 — ends war, creates current constitutional structure." },
  { grp:7, id:14, state:2, yr:'2008', tx:"Stabilisation and Association Agreement (SAA) signed with EU — first step toward membership." },
  { grp:7, id:15, state:2, yr:'2022', tx:"EU grants BiH candidate status Dec 15. General elections held Oct — formation takes months amid ethnic deadlock." },
  { grp:7, id:16, state:2, yr:'2024', tx:"European Council opens accession negotiations Mar 21. Dodik-led RS continues secessionist legislation; constitutional crisis deepens." },
],
  note: "BiH's political structure is the direct product of a peace agreement, not democratic design. Dayton created stability but institutionalised ethnic division — three constituent peoples, two entities, one district, and 14 education ministries. Milorad Dodik's repeated threats to dissolve BiH and his conviction for defying the High Representative (Feb 2024) represent the most serious constitutional crisis since 1995."
};

/* ── Political Era Timeline data ── */
const ERAS = {
  title: 'Bosnia and Herzegovina — An Interactive Era Timeline (1878–2025)',
  note:  "From Habsburg occupation to Dayton governance, Bosnia and Herzegovina has experienced five radically different state structures in under 150 years. The 1995 Dayton Peace Accords ended the war but created one of the world's most complex constitutional arrangements — a tripartite presidency and two entities — widely seen as both a peace guarantee and an obstacle to EU integration.",
  data: [
  { grp:7, id:17, state:2, key:'austro_hungarian', label:'Austro-Hungarian Rule',      short:'Habsburg Era',          start:1878, end:1918, color:'#8B5E3C', colorL:'#b07d52', desc:'Austria-Hungary occupies BiH under the 1878 Congress of Berlin (Art.25 Treaty of Berlin). Rapid modernisation: railways, schools, industry. 1908 formal annexation triggers Bosnian Crisis. Archduke Franz Ferdinand assassinated in Sarajevo 28 June 1914 — spark of WWI.',                                                                    events:['1878 — Congress of Berlin; AH occupation begins','1908 — Formal annexation; Bosnian Crisis erupts','1914 — Franz Ferdinand assassinated in Sarajevo (28 Jun); WWI begins'] },
  { grp:7, id:18, state:2, key:'yugoslavia_kingdom', label:'Kingdom of Yugoslavia',    short:'Royal Yugoslavia',       start:1918, end:1941, color:'#4A6FA5', colorL:'#6a8fc5', desc:'BiH absorbed into the Kingdom of Serbs, Croats and Slovenes (renamed Yugoslavia 1929). Centralised royal dictatorship under King Alexander from 1929. Inter-ethnic tensions between Serbs, Croats and Bosniaks simmer throughout the interwar period.',                                                                                             events:['1918 — Kingdom of SCS formed after WWI collapse of AH','1929 — King Alexander declares dictatorship; country renamed Yugoslavia','1934 — King Alexander assassinated in Marseille'] },
  { grp:7, id:19, state:2, key:'wwii',              label:'WWII & NDH',                short:'Nazi Occupation',        start:1941, end:1945, color:'#2d2d2d', colorL:'#555',    desc:'Yugoslavia invaded April 1941. BiH becomes part of the Ustasha-led Independent State of Croatia (NDH), a Nazi puppet state. Mass atrocities against Serbs, Jews and Roma. Tito\'s Partisans wage resistance; BiH is a central battleground.',                                                                                                    events:['1941 — Axis invasion; NDH established (Apr)','1942 — Jasenovac concentration camp at peak; mass killings','1943 — AVNOJ second session in Jajce; federal Yugoslavia planned','1945 — Liberation; NDH collapses'] },
  { grp:7, id:20, state:2, key:'socialist_yugo',    label:'Socialist Yugoslavia',      short:'Tito Era',               start:1945, end:1992, color:'#C8102E', colorL:'#f03050', desc:'BiH becomes one of six federal republics of Tito\'s Yugoslavia. "Brotherhood and Unity" policy suppresses ethnic nationalism. Sarajevo hosts 1984 Winter Olympics — symbol of multicultural peak. Tito dies 1980; economic crisis and nationalism re-emerge through the 1980s.',                                                                events:['1945 — Socialist Federal Republic of Yugoslavia proclaimed','1974 — New constitution grants BiH greater autonomy','1980 — Tito dies; collective presidency established','1984 — Sarajevo hosts Winter Olympics','1990 — First multi-party elections; nationalist parties dominate'] },
  { grp:7, id:21, state:2, key:'war',               label:'War & Independence',        short:'Bosnian War',            start:1992, end:1995, color:'#555',    colorL:'#777',    desc:'Independence referendum 1 Mar 1992 (99.7% yes; Serbs boycott). War erupts immediately. Siege of Sarajevo — longest siege of a capital in modern warfare: 44 months, ~11,540 dead. Srebrenica massacre July 1995: 8,372 Bosniak men and boys killed — worst atrocity in Europe since WWII.',                                                   events:['1992 — Independence referendum (1 Mar); war begins (6 Apr)','1992 — Siege of Sarajevo begins (longest in modern history)','1993 — Washington Agreement creates Bosniak-Croat Federation','1995 — Srebrenica massacre (Jul 11); 8,372 killed','1995 — NATO airstrikes (Operation Deliberate Force; Aug–Sep)'] },
  { grp:7, id:22, state:2, key:'dayton',            label:'Dayton Bosnia',             short:'Post-War Reconstruction',start:1995, end:2025, color:'#002395', colorL:'#3355cc', desc:'Dayton Peace Accords signed 14 Dec 1995. Country divided: Federation of BiH (51%) and Republika Srpska (49%). High Representative oversees implementation. EU candidacy granted 2022. Road to EU membership ongoing; complex governance structure remains a major obstacle.',                                                                          events:['1995 — Dayton Peace Accords signed (14 Dec)','1996 — IFOR peacekeepers deployed; first post-war elections','2000 — ICTY convicts first war crimes suspects','2008 — ICJ rules Srebrenica was genocide','2016 — SAA with EU enters into force','2022 — EU candidate status granted'] },
]};

const ERA_TOTAL = 2025 - 1878;

/* ── §8 TOURISM ── */
const TOUR_KPI = [
  { grp:8, id:1, state:2, label:"International Arrivals (2024)", value:"~1.39M",    sub:"CEIC / Xinhua Feb 2025; +10.3% YoY; BiH among fastest-growing in Balkans",      accent:C.bih, delay:0.05 },
  { grp:8, id:2, state:2, label:"Tourism Revenue (2024)",        value:"~$1.96B",   sub:"~7% of GDP; CEIC 2024 data",                                                      accent:C.dim, delay:0.10 },
  { grp:8, id:3, state:2, label:"Top draw",                      value:"Mostar",    sub:"Stari Most (Old Bridge) — UNESCO World Heritage; icon of reconciliation",         accent:C.dim, delay:0.15 },
  { grp:8, id:4, state:1, label:"Visa-free countries",           value:"~30",       sub:"Bosnian passport (World Bank / Passport Index 2024)",                             accent:C.dim, delay:0.20 },
  { grp:8, id:5, state:2, label:"UNESCO World Heritage sites",   value:"3 sites",   sub:"Stari Most Mostar (2005) · Mehmed Pasa Bridge Visegrad (2007) · Stecci (2016)",  accent:C.dim, delay:0.25 },
  { grp:8, id:6, state:-1, label:"Tourism target (est.; unverified — no official strategy found)", value:"~2M+ by 2028", sub:"est.; unverified — projected from 5.5% CAGR (reportlinker.com)", accent:C.dim, delay:0.30 },
];

const TOUR_ORIGINS = {
  title: 'Top Visitor Origins (overnight stays, 2024)',
  data: [
  { grp:8, id:7,  state:2, flag:'🇭🇷', country:'Croatia',      val:'largest source market; diaspora + leisure', pct:'13.9%' },
  { grp:8, id:8,  state:2, flag:'🇷🇸', country:'Serbia',       val:'cross-border; regional ties',               pct:'11.5%' },
  { grp:8, id:9,  state:2, flag:'🇹🇷', country:'Turkey',       val:'religious & cultural tourism; growing fast', pct:'9.9%'  },
  { grp:8, id:10, state:2, flag:'🇸🇦', country:'Saudi Arabia', val:'halal tourism; Sarajevo focus',              pct:'7.9%'  },
  { grp:8, id:11, state:2, flag:'🇸🇮', country:'Slovenia',     val:'former Yugoslav ties; short breaks',         pct:'5.8%'  },
  { grp:8, id:12, state:2, flag:'🇩🇪', country:'Germany',      val:'diaspora + heritage tourism',                pct:'4.3%'  },
],
  note: "Source: BHAS (Agency for Statistics of BiH) overnight stays data Jan-Nov 2024. Croatia and Serbia dominate as regional neighbours with strong former-Yugoslav cultural ties. Turkey and Saudi Arabia reflect growing Islamic heritage tourism (Sarajevo, Blagaj tekke, Gazi Husrev-beg Mosque). German visitors are partly BiH diaspora (~350k Bosnians in Germany) returning to visit family."
};

const TOUR_HIGHLIGHTS = {
  title: 'Tourism Highlights',
  data: [
  { grp:8, id:13, state:2, label:'Stari Most, Mostar (UNESCO 2005)',      value:'16th-century Ottoman bridge; symbol of post-war reconciliation; rebuilt 2004' },
  { grp:8, id:14, state:2, label:'Bascarsija, Sarajevo',                  value:'Ottoman bazaar quarter; Sebilj fountain; heart of old Sarajevo' },
  { grp:8, id:15, state:2, label:'1984 Winter Olympics legacy',           value:'Bobsleigh track on Mt Trebevic; ski resorts Jahorina & Bjelasnica still operating' },
  { grp:8, id:16, state:2, label:'Kravice Waterfalls (Herzegovina)',      value:'20 m travertine falls on Trebizat River; emerald pools; popular summer draw' },
  { grp:8, id:17, state:2, label:'Una National Park (NW Bosnia)',         value:'UNESCO candidate; emerald Una River; rafting; Una falls at Bihac' },
  { grp:8, id:18, state:2, label:'Pocitelj & Blagaj (Herzegovina)',       value:'Ottoman-era fortified village; Blagaj tekke (1520) at spring of Buna River' },
  { grp:8, id:19, state:2, label:'Sutjeska National Park',                value:'Oldest NP in ex-Yugoslavia (1962); Perucica old-growth forest; Trnovacko lake' },
],
  gradbar: { title:'Tourism intensity by month (relative)', values:[20,25,40,70,85,90,80,100,90,70,35,20], colorStops:p => `rgb(${Math.round(153+79*p/100)},${Math.round(153-128*p/100)},${Math.round(153-109*p/100)})`, unit:'%' },
  note: "BiH is one of Europe's most underrated destinations — Sarajevo offers a unique confluence of Ottoman, Austro-Hungarian and Yugoslav heritage within walking distance. The country hosted the 1984 Winter Olympics, its infrastructure largely intact. Growth is limited by poor road connections, weak marketing, and political instability — yet arrivals grew 10.3% in 2024 and the trajectory is strongly positive."
};

/* ── §9 VITAL STATISTICS & HEALTH ── */
const VITA_KPI = [
  { grp:9, id:1, state:2, label:"Births (2024)",           value:"25,889",      sub:"Birth rate 8.2/1,000 — one of Europe's lowest (populationpyramids.org 2024)",  accent:C.dim, delay:0.05 },
  { grp:9, id:2, state:2, label:"Natural Decrease (2024)", value:"−9,923",      sub:"25,889 births − 35,812 deaths; structural natural decline (Worldometer 2024)", accent:C.red, delay:0.10 },
  { grp:9, id:3, state:2, label:"Ages 0–14",               value:"13.2%",       sub:"Sharply declining youth share; fertility 1.49 drives rapid ageing (2024)",     accent:C.dim, delay:0.15 },
  { grp:9, id:4, state:2, label:"Ages 65+",                value:"16.2%",       sub:"One of Europe's oldest populations; pension system under strain (2024)",       accent:C.yel, delay:0.20 },
  { grp:9, id:5, state:2, label:"Deaths (2024)",           value:"35,812",      sub:"Death rate 10.1/1,000; deaths exceed births every year (Worldometer 2024)",    accent:C.dim, delay:0.25 },
  { grp:9, id:6, state:2, label:"Infant Mortality",        value:"5.0 / 1,000", sub:"2024 — comparable to EU average; macrotrends / WHO 2024",                     accent:C.dim, delay:0.30 },
];

const VITA_DEATHS = {
  title: 'Causes of Death (WHO / indexmundi, 2023)',
  data: [
  { grp:9, id:7,  state:2, label:"Cardiovascular diseases",  value:"56%",   pct:100, color:C.bih },
  { grp:9, id:8,  state:2, label:"Cancer (neoplasms)",       value:"20%",   pct:36,  color:C.yel },
  { grp:9, id:9,  state:2, label:"Injuries & external",      value:"~3%",   pct:5,   color:C.blu },
  { grp:9, id:10, state:2, label:"Communicable diseases",    value:"~4%",   pct:7,   color:C.dim },
  { grp:9, id:11, state:-1, label:"Respiratory & other (est.; unverified — WHO NCD profile; sub-category breakdown not retrieved)", value:"~17%", pct:30, color:C.dim },
],
  note: "CVD at 56% and cancer at 20% dominate — driven by tobacco (36.2% adult prevalence 2022) and obesity (57% adults overweight/obese 2022). BiH has one of Europe's highest smoking rates and a high-salt, high-fat traditional diet. NCD mortality between ages 30–70 is significantly above EU average. Source: WHO NCD country profile / indexmundi 2023."
};

const VITA_TRENDS = {
  title: 'Marriage & Vital Trends',
  data: [
  { grp:9, id:12, state:2,  label:'Marriages (2023)',                    value:'~17,000 — declining from 18,900 in 2019 (BHAS)' },
  { grp:9, id:13, state:2,  label:'Divorces (2023)',                     value:'3,048 — rising trend (BHAS / Sarajevo Times)' },
  { grp:9, id:14, state:-1, label:'Avg age at first marriage (est.; unverified — BHAS not retrieved)', value:'est. ~27 women · ~30 men' },
  { grp:9, id:15, state:2,  label:'Tobacco use (2022)',                  value:'36.2% of adults — one of Europe\'s highest (WHO)' },
  { grp:9, id:16, state:2,  label:'Overweight / obese adults (2022)',    value:'57% — major NCD driver (WHO)' },
  { grp:9, id:17, state:-1, label:'Maternal mortality (est.; unverified — WHO modelled estimate not retrieved)', value:'est. ~8–12 per 100,000' },
],
  note: "BiH faces a dual demographic crisis: natural decrease (deaths > births) compounded by emigration. Marriages declining and divorces rising signal shifting social structures. The 36.2% tobacco prevalence is a major public health challenge — among the highest in Europe — directly linking to the 56% CVD and 20% cancer death share."
};

const HEALTH_KPI = [
  { grp:9, id:18, state:2,  label:"Health Spending (% GDP)",  value:"~9.1%",     sub:"2022; high by regional standards but low per capita ($667/person) — WHO/World Bank", accent:C.dim, delay:0.05 },
  { grp:9, id:19, state:-1, label:"Out-of-pocket spending (est.; unverified — P4H network; year not confirmed)", value:"~35%", sub:"est.; unverified", accent:C.dim, delay:0.10 },
  { grp:9, id:20, state:2,  label:"Life expectancy",           value:"78.0 yrs",  sub:"♀ 81.1 · ♂ 74.6 — consistent with POP_KPI (World Bank 2024)",                    accent:C.dim, delay:0.15 },
  { grp:9, id:21, state:2,  label:"Cardiovascular mortality",  value:"56% of deaths", sub:"Highest NCD burden; driven by smoking 36% + obesity 57% (WHO 2023)",          accent:C.dim, delay:0.20 },
  { grp:9, id:22, state:-1, label:'Doctors per 1,000 (est.; unverified — most recent WHO data is 1999 at 1.4; current est.)', value:'~2.0–2.5', sub:'est.; unverified', accent:C.dim, delay:0.25 },
  { grp:9, id:23, state:2,  label:"Sarajevo PM2.5 (2024)",     value:"AQI 91",    sub:"Moderately poor; winter wood burning + traffic; IQAir 2024",                      accent:C.dim, delay:0.30 },
];

const HEALTH_FACTS = {
  title: 'Health System Facts',
  data: [
  { grp:9, id:24, state:2,  label:'Health system structure', value:'Fragmented: 13 separate health ministries (10 FBiH cantons + RS + FBiH federal + Brcko)' },
  { grp:9, id:25, state:2,  label:'Tobacco prevalence (2022)', value:'36.2% adults — among Europe\'s highest; major CVD and cancer driver (WHO)' },
  { grp:9, id:26, state:2,  label:'Obesity / overweight (2022)', value:'57% adults overweight or obese (WHO) — significant NCD risk factor' },
  { grp:9, id:27, state:2,  label:'War trauma legacy', value:'~100,000 killed 1992-95; high PTSD prevalence; mental health services historically underfunded' },
  { grp:9, id:28, state:2,  label:'Sarajevo air quality', value:'AQI 91 (2024) — wood burning + diesel; valley topography traps winter smog (IQAir)' },
  { grp:9, id:29, state:2,  label:'Infant mortality', value:'5.0/1,000 (2024) — comparable to EU average; significant improvement from ~20/1,000 in 1995' },
],
  note: "BiH\'s health system is among Europe\'s most fragmented — 13 separate ministries with different coverage rules and drug lists. Coordination failures mean patients in one canton may not have access to treatments available in another. War trauma legacy (PTSD, landmine injuries) adds a long-term burden that the system has historically under-resourced."
};

const HEALTH_BURDEN = {
  title: 'Disease & Health Burden',
  data: [
  { grp:9, id:30, state:2,  label:"CVD mortality share (WHO 2023)",                                        value:"56%",         pct:100, color:C.bih },
  { grp:9, id:31, state:2,  label:"Cancer mortality share (WHO 2023)",                                     value:"20%",         pct:36,  color:C.yel },
  { grp:9, id:32, state:2,  label:"Tobacco use — adults (WHO 2022)",                                       value:"36.2%",       pct:65,  color:C.dim },
  { grp:9, id:33, state:2,  label:"Overweight/obese adults (WHO 2022)",                                    value:"57%",         pct:100, color:C.blu },
  { grp:9, id:34, state:-1, label:"PTSD prevalence (est.; unverified — survey outdated; Lancet 2006 est.)", value:"~18% in conflict-affected areas", pct:32, color:C.dim },
],
  note: "BiH\'s NCD burden is severe by European standards — a product of high smoking rates, diet, and a health system too fragmented to run effective prevention campaigns nationally. The war trauma legacy (PTSD ~18% in affected areas, Lancet 2006) adds a mental health dimension that remains structurally underfunded. Landmines still contaminate ~2% of BiH territory — ongoing injury risk."
};

/* ── §10 ENERGY ── */
const ENERGY_KPI = [
  { grp:10, id:1, state:2, label:"Energy mix (2024)",          value:"62% coal · 33% hydro", sub:"Net electricity exporter — only country in Western Balkans (lowcarbonpower.org 2024)", accent:C.bih, delay:0.05 },
  { grp:10, id:2, state:2, label:"Installed hydro capacity",   value:"2,129 MW",   sub:"Largest 10MW+ plants; + 169 MW small hydro; major rivers Neretva, Vrbas, Drina (lowcarbonpower.org 2024)", accent:C.dim, delay:0.10 },
  { grp:10, id:3, state:2, label:"Installed lignite capacity",  value:"1,965 MW",   sub:"Aging coal plants; under EU decarbonisation pressure; major plants Tuzla, Kakanj, Ugljevik", accent:C.dim, delay:0.15 },
  { grp:10, id:4, state:2, label:"Renewables target (2030)",   value:"43.6%",      sub:"Share of final energy from renewables; 70% for electricity — draft NECP 2023 (IRENA)",       accent:C.yel, delay:0.20 },
  { grp:10, id:5, state:2, label:"Solar installed (2024)",      value:"608 MW",     sub:"Fast-growing; 2,963 MW technical solar potential (IRENA); up from near zero in 2020",        accent:C.dim, delay:0.25 },
  { grp:10, id:6, state:2, label:"Wind installed (2024)",       value:"219 MW",     sub:"13,141 MW total wind potential (IRENA); significant untapped capacity",                       accent:C.dim, delay:0.30 },
];

const ENERGY_MIX = {
  title: 'Electricity Generation Mix (2024)',
  data: [
  { grp:10, id:7, state:2, label:'Coal / lignite',              value:'~62%', pct:62, color:C.dim },
  { grp:10, id:8, state:2, label:'Hydropower',                  value:'~33%', pct:33, color:C.blu },
  { grp:10, id:9, state:2, label:'Solar & wind',                value:'~5%',  pct:5,  color:C.yel },
],
  label: 'Net exporter',
  sublabel: 'only in W. Balkans',
  note: "Source: lowcarbonpower.org 2024. BiH is one of Europe's most coal-dependent grids (62%) — a direct consequence of its large lignite deposits. The hydropower share (~33%) varies significantly by hydrological year. BiH is a net electricity exporter — a strategic asset. The 2030 NECP target of 70% renewable electricity requires massive investment in wind and solar to replace aging lignite plants under EU accession pressure."
};

const ENERGY_FACTS = {
  title: 'Energy & Resources Facts',
  data: [
  { grp:10, id:10, state:2, label:'Lignite (brown coal) reserves', value:'Significant — Tuzla, Kakanj, Ugljevik, Gacko plants; major export earner historically' },
  { grp:10, id:11, state:2, label:'Hydropower potential', value:'6,110 MW total technical potential (IRENA); currently 2,298 MW installed; large untapped' },
  { grp:10, id:12, state:2, label:'Net electricity exporter', value:'Only net exporter in Western Balkans; exports to Croatia, Serbia, Montenegro (Bankwatch 2024)' },
  { grp:10, id:13, state:2, label:'Coal phase-out pressure', value:'EU accession requires decarbonisation; aging plants (some 50+ yrs) face closure by 2030s' },
  { grp:10, id:14, state:2, label:'Biomass potential', value:'Most abundant renewable resource; significant forestry sector; under-utilised for energy (IRENA 2023)' },
  { grp:10, id:15, state:2, label:'No oil or gas production', value:'BiH imports all oil and gas; highly dependent on regional pipelines (Russia/Croatia/Serbia routes)' },
],
  note: "BiH faces a classic energy transition dilemma: coal provides jobs, grid stability, and export revenue; EU accession demands rapid decarbonisation. The lignite plants at Tuzla, Kakanj and Ugljevik are among the most polluting in Europe per the EEA. The 6,110 MW untapped hydro potential and excellent wind resource (13,141 MW) give BiH a credible path to a clean grid — but require investment and political will that the fragmented governance structure struggles to deliver."
};

/* ── §11 INFRASTRUCTURE ── */
const INFRA_KPI = [
  { grp:11, id:1, state:2, label:"Internet Penetration",  value:"86.1%",       sub:"2.5M users; DataReportal / indexmundi 2024",                                     accent:C.bih, delay:0.05 },
  { grp:11, id:2, state:2, label:"Mobile Subscribers",    value:"3.87M (~98%)", sub:"98% market penetration; BH Telecom 42.3%, m:tel 36.2%, HT Eronet 21.1% (2024)", accent:C.dim, delay:0.10 },
  { grp:11, id:3, state:2, label:"Motorway network",      value:"255.7 km",     sub:"As of 2025; Corridor 5c (337 km total) only 140 km complete after 20+ yrs (Wikipedia)", accent:C.dim, delay:0.15 },
  { grp:11, id:4, state:-1, label:"Railway network (est.; unverified — km figure not retrieved)", value:"~600 km active", sub:"est.; unverified — egtre.info; degraded post-Yugoslav network", accent:C.dim, delay:0.20 },
  { grp:11, id:5, state:2, label:"Corridor 5c progress",  value:"140/337 km done", sub:"Budapest–Ploce route; Sarajevo–Adriatic target 2026; EBRD/EIB financed",     accent:C.yel, delay:0.25 },
  { grp:11, id:6, state:-1, label:"5G status (est.; unverified — no 2024 BiH 5G data retrieved)", value:"Limited / in rollout", sub:"est.; unverified", accent:C.dim, delay:0.30 },
];

const INFRA_PROJECTS = {
  title: 'Key Infrastructure Projects',
  data: [
  { grp:11, id:7,  state:2, label:'Corridor 5c motorway (Budapest–Ploce)', value:'Largest BiH infrastructure project; only 140/337 km complete; target: Sarajevo–Adriatic in 2h by 2026' },
  { grp:11, id:8,  state:2, label:'Golubinja tunnel (Corridor 5c)', value:'3,600 m — second longest tunnel in BiH; Poprikuse-Nemila section; EBRD-financed' },
  { grp:11, id:9,  state:2, label:'EU connectivity financing', value:'68+ km of motorway co-funded by EU grants + EBRD + EIB loans; Western Balkans Investment Framework' },
  { grp:11, id:10, state:2, label:'Sarajevo–Mostar fast road', value:'Key economic artery connecting FBiH capital to Herzegovina and Adriatic coast' },
  { grp:11, id:11, state:-1, label:'Rail modernisation (est.; unverified — no specific project data retrieved)', value:'Yugoslav-era network; under-invested; electrified Sarajevo–Zenica corridor' },
  { grp:11, id:12, state:2, label:'Sarajevo airport expansion', value:'International airport; ~1M passengers/year; upgrade plans under discussion' },
],
  note: "Corridor 5c is BiH's most important infrastructure project and a key condition for EU integration — it will connect Hungary to the Adriatic through BiH's heartland. After 20+ years of construction, only 140 of 337 km are complete. Political fragmentation (two entities, different contracting authorities) is the primary cause of delays, not financing."
};

const INFRA_DIGITAL = {
  title: 'Digital Indicators',
  data: [
  { grp:11, id:13, state:2,  label:"Internet penetration (2024)",          value:"86.1%", pct:86, color:C.bih },
  { grp:11, id:14, state:2,  label:"Mobile penetration (2024)",            value:"~98%",  pct:98, color:C.yel },
  { grp:11, id:15, state:-1, label:"Fixed broadband (est.; unverified)",   value:"~30%",  pct:30, color:C.blu },
  { grp:11, id:16, state:-1, label:"E-government uptake (est.; unverified)", value:"~40%", pct:40, color:C.dim },
  { grp:11, id:17, state:-1, label:"Social media penetration (est.; unverified)", value:"~65%", pct:65, color:C.dim },
],
  note: "BiH has solid internet and near-universal mobile penetration for a country of its GDP. Fixed broadband and e-government lag — fragmented governance means 13 separate digital transformation strategies with limited coordination. The IT sector is one of BiH's fastest-growing industries, with software outsourcing to EU clients a notable bright spot amid the broader brain drain trend."
};

/* ── §12 SOCIAL ── */
const SOCIAL_KPI = [
  { grp:12, id:1, state:-1, label:"Poverty rate (est.; unverified — WB 2024 not retrieved)",  value:"~17–18%",     sub:"National poverty line est.; unverified — last confirmed 17.5% in 2021 (World Bank)", accent:C.dim, delay:0.05 },
  { grp:12, id:2, state:-1, label:"Gini Coefficient (est.; unverified — 2024 not retrieved)", value:"~33–34",      sub:"est.; unverified — last WB value ~33 (2011 survey); inequality data sparse",           accent:C.dim, delay:0.10 },
  { grp:12, id:3, state:2,  label:"Gender Inequality Index (2021)",  value:"0.136 (rank 38)", sub:"UNDP HDR 2021; rank 38/191 — relatively strong for SE Europe",                        accent:C.bih, delay:0.15 },
  { grp:12, id:4, state:2,  label:"Global Gender Gap (2025)",        value:"0.717 (rank 73)", sub:"World Economic Forum 2025; education gap closed; labour market gap remains",            accent:C.dim, delay:0.20 },
  { grp:12, id:5, state:2,  label:"Women in parliament (Feb 2024)",  value:"19.1%",           sub:"House of Representatives; below EU average; gender quotas in place but underperforming", accent:C.yel, delay:0.25 },
  { grp:12, id:6, state:2,  label:"Domestic violence (2018)",        value:"3.4% past-year",  sub:"Women 15–49 reporting physical/sexual IPV in last 12 months (UN Women / BiH survey)",   accent:C.dim, delay:0.30 },
];

const SOCIAL_SERVICES = {
  title: 'Access & Basic Services',
  data: [
  { grp:12, id:7,  state:-1, label:"Access to clean water (urban, est.; unverified)",    value:"~98%+",  pct:98,  color:C.bih },
  { grp:12, id:8,  state:-1, label:"Access to clean water (rural, est.; unverified)",    value:"~85%",   pct:85,  color:C.yel },
  { grp:12, id:9,  state:2,  label:"EIB water/sanitation investment (cumulative)",       value:"€240M",  pct:60,  color:C.blu },
  { grp:12, id:10, state:-1, label:"Access to basic sanitation (est.; unverified)",      value:"~95%+",  pct:95,  color:C.dim },
  { grp:12, id:11, state:-1, label:"Electricity access (est.; unverified)",              value:"~100%",  pct:100, color:C.dim },
],
  note: "BiH has generally good access to water and electricity for a country at its income level — a Yugoslav-era infrastructure legacy. Rural water quality and sanitation systems are in need of modernisation; EIB has invested €240M for upgrades. The June 2024 power outage (affecting most of the country) highlighted grid fragility — BiH operates split electricity systems across its two entities."
};

const SOCIAL_COHESION = {
  title: 'Social Cohesion & Gender',
  data: [
  { grp:12, id:12, state:2,  label:'Women in parliament (2024)', value:'19.1% — below EU norm; gender quotas mandated but enforcement weak (UN Women 2024)' },
  { grp:12, id:13, state:2,  label:'GII rank (UNDP 2021)', value:'0.136 — rank 38/191; relatively strong on health/education dimensions' },
  { grp:12, id:14, state:2,  label:'Education gender parity', value:'Female tertiary enrolment 1.4× male rate — women outperform in education (World Bank 2023)' },
  { grp:12, id:15, state:2,  label:'War crimes legacy', value:'ICTY convicted 90 persons; Srebrenica genocide ruling (ICJ 2007); reconciliation ongoing' },
  { grp:12, id:16, state:2,  label:'Landmine contamination', value:'~2% of territory still affected; 50,000+ mines estimated remaining (BHMAC 2024)' },
  { grp:12, id:17, state:2,  label:'Ethnic segregation in schools', value:'"Two schools under one roof" in ~50 FBiH communities; ruled discriminatory; largely unreformed' },
],
  note: "BiH\'s social fabric remains shaped by the 1992-95 war. Ethnic segregation in schools, ongoing landmine contamination, and unresolved war crimes reconciliation are the most visible legacy issues. Gender equality shows a paradox: women outperform men in education but are significantly underrepresented in parliament (19.1%) and the labour market — a gap driven by cultural norms and structural barriers."
};

/* ── §13 ENVIRONMENT ── */
const ENV_KPI = [
  { grp:13, id:1, state:2,  label:"CO₂ per capita (2022)",          value:"~5.4 t",            sub:"Above EU avg due to coal-heavy grid; 62% coal in energy mix (IEA 2022)",           accent:C.dim, delay:0.05 },
  { grp:13, id:2, state:2,  label:"Forest cover",                   value:"54%",               sub:"One of highest in Europe; mainly Dinaric broadleaf forest; FAOSTAT 2022",           accent:C.bih, delay:0.10 },
  { grp:13, id:3, state:2,  label:"NDC target (2030)",              value:"−12.5% GHG",        sub:"vs 1990 baseline; conditional on EU/international support (BiH NDC 2021)",           accent:C.dim, delay:0.15 },
  { grp:13, id:4, state:2,  label:"Sarajevo air quality (AQI)",     value:"91 (Moderate)",     sub:"Annual avg; winter spikes to Hazardous (AQI 300+) from wood/coal heating",           accent:C.red, delay:0.20 },
  { grp:13, id:5, state:2,  label:"Protected areas",                value:"~1.8%",             sub:"Nationally designated; 2 national parks (Sutjeska · Una); target expansion pending", accent:C.dim, delay:0.25 },
  { grp:13, id:6, state:2,  label:"Landslide risk",                 value:"High",              sub:"~40% of territory at risk; 2014 floods triggered worst landslides in 120 years",     accent:C.dim, delay:0.30 },
];

const ENV_FACTS = {
  title: 'Environmental Facts',
  data: [
  { grp:13, id:7,  state:2,  label:'CO₂ per capita vs EU avg',       value:'~5.4t vs ~6.8t — below EU avg but high for income level; coal grid is main driver' },
  { grp:13, id:8,  state:2,  label:'Sarajevo winter pollution',       value:'WHO PM2.5 guideline (5 µg/m³) exceeded by 10–20× in winter peaks — wood/coal heating + geography (valley trap)' },
  { grp:13, id:9,  state:2,  label:'Coal phase-out timeline',         value:'No firm date; EU accession process requires Energy Community Treaty compliance; strong political resistance' },
  { grp:13, id:10, state:2,  label:'Sava & Neretva river quality',    value:'Generally good; threatened by micro-plastics and untreated municipal waste from smaller towns' },
  { grp:13, id:11, state:2,  label:'National parks',                  value:'Sutjeska (primeval Perucica forest — one of last in Europe) and Una NP; Blidinje Nature Park' },
  { grp:13, id:12, state:-1, label:'Plastic waste per capita (est.; unverified — no 2024 figure retrieved)', value:'est.; unverified — likely 20–30 kg/capita/yr; recycling infrastructure minimal' },
],
  note: "BiH\'s main environmental paradox: 54% forest cover and abundant water make it one of Europe\'s greenest countries by landscape, yet Sarajevo regularly records among Europe\'s worst air quality — a result of coal-burning power plants, wood/coal household heating, and the bowl-shaped valley geography that traps pollution. The coal phase-out required for EU accession is the central environmental policy tension."
};

const ENV_WATER = {
  title: 'Pollution & Risk Profile',
  data: [
  { grp:13, id:13, state:2,  label:"Forest cover vs European avg (~40%)",      value:"54% — well above avg",  pct:54,  color:C.bih },
  { grp:13, id:14, state:2,  label:"Sarajevo AQI (annual avg)",                value:"91 — Moderate",         pct:45,  color:C.red },
  { grp:13, id:15, state:2,  label:"Protected area (% territory)",              value:"~1.8%",                 pct:18,  color:C.dim },
  { grp:13, id:16, state:2,  label:"Landslide-risk territory",                  value:"~40%",                  pct:40,  color:C.yel },
],
  note: "The 2014 Balkan floods were the worst in 120 years — affecting all of BiH and triggering hundreds of landslides, displacing 1 million people across the region. Climate projections show increased drought frequency in summer and higher precipitation intensity in autumn/winter — both trends heighten flood and landslide risk for a country where 40% of territory is already considered at risk."
};

/* ── §14 BUSINESS ── */
const BIZ_KPI = [
  { grp:14, id:1, state:2,  label:"Corporate tax rate (FBiH / RS)",  value:"10% / 10%",     sub:"Both entities apply 10% flat rate — one of lowest in Europe (PwC 2024)",              accent:C.bih, delay:0.05 },
  { grp:14, id:2, state:2,  label:"VAT rate",                         value:"17%",            sub:"Single indirect tax authority (ITA); VAT introduced 2006 at 17%; unchanged since",    accent:C.dim, delay:0.10 },
  { grp:14, id:3, state:2,  label:"FDI (2023)",                       value:"~$700M",         sub:"World Bank BoP data 2023; low relative to GDP; political complexity key deterrent",    accent:C.dim, delay:0.15 },
  { grp:14, id:4, state:2,  label:"Corruption Index (TI 2024)",       value:"33/100 (rank 109)",sub:"Historic low; Dayton institutions create overlapping jurisdictions enabling graft",   accent:C.yel, delay:0.20 },
  { grp:14, id:5, state:2,  label:"WTO membership",                   value:"Since 2005",     sub:"Joined WTO 2005; CEFTA 2006; SAA with EU 2008; EU candidate Dec 2022",                accent:C.dim, delay:0.25 },
  { grp:14, id:6, state:-1, label:"Ease of Doing Business (est.; unverified — WB discontinued index)", value:"~Rank 90–100",sub:"est.; unverified — WB discontinued ranking in 2021; BiH scored poorly on regulatory complexity", accent:C.dim, delay:0.30 },
];

const BIZ_CLIMATE = {
  title: 'Investment Climate Summary',
  data: [
  { grp:14, id:7,  state:2,  label:'CPI score (TI 2024)', value:'33/100 — rank 109/180; historic low; Dayton complexity enables systemic corruption' },
  { grp:14, id:8,  state:2,  label:'Corporate tax (both entities)', value:'10% flat — EU-competitive; dividends also low-taxed' },
  { grp:14, id:9,  state:2,  label:'Labour cost advantage', value:'Avg wage ~€1,060/mo (2,020 BAM) — significantly below EU avg; skilled manufacturing workforce' },
  { grp:14, id:10, state:2,  label:'EU candidate status (Dec 2022)', value:'Accession process activating; EU-aligned legislation reforms underway' },
  { grp:14, id:11, state:2,  label:'CEFTA membership', value:'Free trade access to Western Balkans market (~21M people) since 2006' },
  { grp:14, id:12, state:2,  label:'Key FDI sectors', value:'Manufacturing (metals/auto parts), energy, retail; Austrian, Croatian, Serbian investors dominant' },
],
  note: "BiH\'s investment climate is a paradox: 10% corporate tax and low labour costs are genuinely attractive, yet FDI ($700M in 2023) is far below regional peers. The core deterrent is not economics — it is the Dayton structure, which creates 14 governments with overlapping regulatory authority, making permits, land registration, and contract enforcement unpredictable."
};

const BIZ_RISKS = {
  title: 'Key Risks & Opportunities',
  data: [
  { grp:14, id:13, state:2,  label:"EU accession opportunity",            value:"High — if reforms proceed",       pct:80, color:C.bih },
  { grp:14, id:14, state:2,  label:"Tourism growth potential",            value:"Strong — 2M+ target by 2028",     pct:75, color:C.yel },
  { grp:14, id:15, state:2,  label:"Hydro/renewable energy export",       value:"Significant",                     pct:65, color:C.blu },
  { grp:14, id:16, state:2,  label:"Political fragmentation risk",        value:"Persistent — Dayton deadlock",     pct:80, color:C.dim },
  { grp:14, id:17, state:2,  label:"Brain drain risk",                    value:"Severe — ~30%+ graduates emigrate",pct:75, color:C.dim },
  { grp:14, id:18, state:2,  label:"Coal transition cost risk",           value:"High — EU energy acquis pressure", pct:70, color:C.dim },
],
  note: "BiH\'s risk/opportunity profile is dominated by EU accession: it unlocks investment, structural funds, and market access, but demands governance reforms the Dayton structure actively resists. Brain drain is the most immediate economic threat — if the working-age population continues emigrating, even successful EU accession may not generate growth fast enough to reverse demographic decline."
};

const FISCAL_KPI = [
  { grp:14, id:19, state:2,  label:"Govt Debt / GDP (2024)",       value:"~33.7%",         sub:"IMF/World Bank; moderate; primarily multilateral (IMF, World Bank, EU) lending",      accent:C.dim, delay:0.05 },
  { grp:14, id:20, state:2,  label:"Budget balance (2023)",        value:"~+1.0% GDP",     sub:"Small surplus; entity-level budgets; ITA collects indirect taxes centrally",           accent:C.dim, delay:0.10 },
  { grp:14, id:21, state:2,  label:"Exports (goods, 2023)",        value:"~$9.2B",         sub:"WTO/ITA data; implied from 2024 figure $8.9B (-3.6% YoY); metals, electrical, wood, electricity",                  accent:C.dim, delay:0.15 },
  { grp:14, id:22, state:2,  label:"Imports (goods, 2023)",        value:"~$15.6B",        sub:"Machinery, energy, food; trade deficit ~$6B; partially offset by remittances",        accent:C.dim, delay:0.20 },
  { grp:14, id:23, state:2,  label:"Current Account (2023)",       value:"~−3.0% GDP",     sub:"World Bank; remittances (~10.5% GDP) significantly cushion goods trade deficit",      accent:C.dim, delay:0.25 },
  { grp:14, id:24, state:-1, label:"Foreign reserves (est.; unverified — CBBiH 2024 not retrieved)", value:"~€7–8B",sub:"est.; unverified — CBBiH publishes reserves data; BAM peg requires full EUR cover", accent:C.dim, delay:0.30 },
];

const FISCAL_EXPORTS = {
  title: 'Top Export Destinations (2023)',
  data: [
  { grp:14, id:25, state:2, flag:'🇩🇪', country:'Germany',     val:'metals, auto parts, electrical equipment', pct:'~15%' },
  { grp:14, id:26, state:2, flag:'🇮🇹', country:'Italy',       val:'metals, wood, textiles',                   pct:'~13%' },
  { grp:14, id:27, state:2, flag:'🇭🇷', country:'Croatia',     val:'CEFTA partner; goods & electricity',       pct:'~11%' },
  { grp:14, id:28, state:2, flag:'🇦🇹', country:'Austria',     val:'manufactured goods; major investor',        pct:'~8%'  },
  { grp:14, id:29, state:2, flag:'🇸🇮', country:'Slovenia',    val:'CEFTA/EU partner; industrial goods',        pct:'~7%'  },
  { grp:14, id:30, state:2, flag:'🇷🇸', country:'Serbia',      val:'CEFTA partner; largest neighbour',          pct:'~6%'  },
],
  note: "EU countries account for ~74% of BiH\'s total trade — Germany and Italy alone take ~28% of exports. This deep EU integration is the economic anchor for accession: BiH already operates within EU regulatory and supply-chain norms in many sectors. The remaining 26% is dominated by regional CEFTA partners (Serbia, Croatia, Slovenia)."
};

const FISCAL_INDICATORS = {
  title: 'Key Fiscal Indicators',
  data: [
  { grp:14, id:31, state:2,  label:'Govt debt / GDP (2024)', value:'~33.7% — moderate; IMF/WB; multilateral-funded majority' },
  { grp:14, id:32, state:2,  label:'Budget balance (2023)', value:'~+1.0% GDP surplus — entity-level coordination via ITA indirect tax' },
  { grp:14, id:33, state:2,  label:'Remittances / GDP', value:'~10.5% GDP — among highest in Europe; major external balance cushion' },
  { grp:14, id:34, state:2,  label:'EU trade share', value:'~74% of total trade — already deeply integrated into EU supply chains' },
  { grp:14, id:35, state:2,  label:'BAM currency peg', value:'1 EUR = 1.95583 BAM — fixed since 1997; Currency Board arrangement' },
  { grp:14, id:36, state:2,  label:'ITA indirect tax authority', value:'Single VAT/customs collection for all of BiH since 2004 — fiscal integration amid political fragmentation' },
  { grp:14, id:37, state:2,  label:'GDP per capita growth 2015–2024', value:'From ~$4,600 to $8,221 — +79%; convergence ongoing but slow' },
],
  gradbar: { title:'Trade balance 2015–2023 ($B)', values:[-3.2,-3.5,-3.8,-4.7,-5.5,-4.2,-5.8,-6.5,-5.9], xLabels:['2015','2016','2017','2018','2019','2020','2021','2022','2023'], colorStops:(p,v) => v >= 0 ? `rgb(${Math.round(46-46*p/100)},${Math.round(134+0*p/100)},${Math.round(222-100*p/100)})` : `rgb(${Math.round(232+0*p/100)},${Math.round(25+0*p/100)},${Math.round(44+0*p/100)})`, fmt:v => v > 0 ? `+${v}B` : `${v}B`, absScale:true },
  note: "BiH runs a persistent goods trade deficit (~$6B in 2023) funded primarily by remittances from the diaspora (~10.5% of GDP) and EU structural grants. The BAM currency board peg to the Euro — unchanged since 1997 — is the single most stabilising macroeconomic institution in the country, operating independently of politics and maintaining monetary credibility even through deep political crises."
};

/* ── §15 CRIME ── */
const CRIME_KPI = [
  { grp:15, id:1, state:1,  label:"Global Peace Index (IEP GPI 2026)", value:"1.810 · Rank 48/163", sub:"IEP GPI 2026", accent:C.dim, delay:0.05 },
  { grp:15, id:2, state:2,  label:"Homicide rate (UNODC 2022)",  value:"~1.5 / 100K",  sub:"Below EU average (~1.0) but higher than Western Balkans best performers (UNODC)",        accent:C.dim, delay:0.10 },
  { grp:15, id:3, state:2,  label:"Corruption Index (TI 2024)",  value:"33/100 (rank 109)", sub:"Historic low; structural corruption linked to Dayton's 14-government complexity",    accent:C.yel, delay:0.15 },
  { grp:15, id:4, state:1,  label:"Press Freedom (RSF 2026)",    value:"Rank 90/180",   sub:"RSF 2026; score 54.3/100; classified Problematic; political pressure on public broadcasters", accent:C.dim, delay:0.20 },
  { grp:15, id:5, state:2,  label:"Organised crime (OCCRP)",     value:"Regional hub",  sub:"Balkans corridor for drugs (heroin/cocaine) & human trafficking; OCCRP/Europol reports", accent:C.red, delay:0.25 },
  { grp:15, id:6, state:2,  label:"War crimes prosecuted (ICTY)", value:"90 convicted", sub:"ICTY closed 2017; 90 persons convicted; domestic war crimes courts continuing (BIRN)",   accent:C.dim, delay:0.30 },
];

const CRIME_INDICATORS = {
  title: 'Crime & Security Indicators',
  data: [
  { grp:15, id:7,  state:2,  label:'Homicide rate (UNODC 2022)', value:'~1.5 per 100,000 — below EU avg; significant reduction since 1990s war period' },
  { grp:15, id:8,  state:2,  label:'Drug trafficking', value:'Balkan Route for heroin (Afghan origin) and cocaine; BiH used as staging/storage country (Europol/UNODC)' },
  { grp:15, id:9,  state:2,  label:'Human trafficking', value:'Source, transit, and destination country; mainly labour & sexual exploitation (US TIP Report 2024: Tier 2)' },
  { grp:15, id:10, state:2,  label:'Landmine legacy', value:'~50,000 mines estimated; ~2% of territory; BHMAC clearing ~2–3 km² per year; clearance target 2025 missed' },
  { grp:15, id:11, state:2,  label:'War crimes courts', value:'ICTY closed 2017 (90 convicted); domestic War Crimes Chamber Sarajevo continuing — 400+ cases pending (BIRN 2024)' },
  { grp:15, id:12, state:2,  label:'Srebrenica genocide denial', value:'RS entity leadership publicly denies genocide ruling (ICJ 2007); destabilising political factor; EU monitoring' },
],
  note: "BiH\'s security challenges are layered: post-war crime normalisation, organised crime entrenchment in the Balkans corridor, and the unresolved political tension between war crimes accountability and entity-level genocide denial. The country is classified Tier 2 by the US State Department on human trafficking — meaning it does not fully meet minimum standards but is making significant efforts."
};

const CRIME_SECURITY = {
  title: 'Governance & Security Scores',
  data: [
  { grp:15, id:13, state:2,  label:"Corruption (CPI 2024, 100=clean)",                                                                                value:"33/100",  pct:33, color:C.yel },
  { grp:15, id:14, state:1,  label:"Press freedom score (RSF 2026, 100=most free)",                                                                     value:"54.3/100", pct:54, color:C.dim },
  { grp:15, id:15, state:1,  label:"Rule of law (WJP 2025, 100=best)",                                                                                value:"57/100",  pct:57, color:C.blu },
  { grp:15, id:16, state:1,  label:"Political rights (Freedom House 2025, 100=best)",                                                                    value:"52/100",  pct:52, color:C.dim },
],
  note: "BiH is classified \'Partly Free\' by Freedom House — a significant distinction from Uzbekistan\'s \'Not Free\' status. Genuine elections take place; civil society and independent media exist. The governance deficit is structural rather than authoritarian: the Dayton system creates 14 governments with overlapping mandates, enabling corruption by diffusing accountability. Rule of law weakness stems from judicial appointment politicisation across entity lines."
};

// ************************************************************
// TEMPLATE — css · components · html
// ************************************************************

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=Inter:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; }
  body { background: ${C.bg}; }
  .dash { background:${C.bg}; color:${C.txt}; font-family:'Inter',sans-serif; font-weight:300; line-height:1.6; padding: 0 22px 80px; max-width:1020px; margin:0 auto; overflow-x: hidden; }
  @keyframes up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
  .kpi { animation: up .4s ease forwards; opacity:0; }
  .row.g-1 { --bs-gutter-x: 2px; --bs-gutter-y: 2px; margin-bottom: 2px; }
  .subnote { font-size:11px; color:${C.sub}; margin-top:10px; margin-bottom:0; line-height:1.6; }
  .panel-sublabel { font-size:11px; color:${C.sub}; margin-bottom:11px; letter-spacing:0.04em; }
  .section-icon { color:${C.txt}; font-size:16px; flex-shrink:0; }
  .section-title { font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:${C.txt}; font-weight:500; }
  .panel { background:${C.card}; border:1px solid ${C.border}; padding:20px; height:100%; }
  .panel-title { font-family:'Fraunces',serif; font-weight:700; font-size:13px; color:${C.txt}; margin-bottom:16px; padding-bottom:11px; border-bottom:1px solid ${C.border}; display:flex; align-items:center; gap:8px; }
  .panel-title-icon { color:${C.txt}; flex-shrink:0; }
  .bar { margin-bottom:13px; }
  .bar-header { display:flex; justify-content:space-between; align-items:baseline; font-size:12px; color:${C.sub}; margin-bottom:5px; gap:4px; }
  .bar-label { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; }
  .bar-value { color:${C.txt}; font-weight:500; flex-shrink:0; white-space:nowrap; }
  .bar-track { height:6px; background:${C.track}; border-radius:3px; overflow:hidden; }
  .bar-fill { height:100%; border-radius:3px; }
  .tbl { width:100%; border-collapse:collapse; table-layout:fixed; }
  .tbl td:first-child { padding:9px 4px; font-size:12.5px; color:${C.sub}; width:58%; overflow-wrap:break-word; }
  .tbl td:last-child { padding:9px 4px; font-size:14px; color:${C.txt}; font-weight:500; text-align:right; font-family:'Fraunces',serif; overflow-wrap:break-word; }
  .kpi { background:${C.card}; border:1px solid ${C.border}; padding:18px 15px 15px; position:relative; overflow:hidden; width:100%; flex:1; }
  .kpi-accent { position:absolute; bottom:0; left:0; right:0; height:2px; }
  .kpi-label { font-size:10px; letter-spacing:0.11em; text-transform:uppercase; color:${C.sub}; margin-bottom:6px; }
  .kpi-value { font-family:'Fraunces',serif; font-weight:900; font-size:18px; line-height:1; margin-bottom:4px; word-break:break-word; }
  .kpi-sub { font-size:11px; color:${C.sub}; line-height:1.4; }
  .regcard { background:${C.card}; border:1px solid ${C.border}; padding:18px 14px; position:relative; overflow:hidden; height:100%; }
  .regcard-stripe { position:absolute; top:0; left:0; right:0; height:3px; }
  .regcard-name { font-family:'Fraunces',serif; font-weight:700; font-size:15px; color:${C.txt}; margin-bottom:3px; }
  .regcard-type { font-size:10px; letter-spacing:0.09em; text-transform:uppercase; color:${C.sub}; margin-bottom:9px; }
  .regcard-desc { font-size:12px; color:${C.muted}; line-height:1.6; }
  .dlrow { display:flex; align-items:center; gap:8px; margin-bottom:6px; }
  .dlrow-mo { font-size:10px; letter-spacing:0.05em; text-transform:uppercase; color:${C.sub}; width:24px; flex-shrink:0; }
  .dlrow-track { flex:1; height:18px; background:${C.track}; border-radius:3px; overflow:hidden; min-width:0; }
  .dlrow-fill { height:100%; border-radius:3px; display:flex; align-items:center; padding-left:6px; }
  .dlrow-label { font-size:9px; font-weight:500; white-space:nowrap; overflow:hidden; }
  #top { padding:20px 0 0; display:grid; grid-template-columns:1fr minmax(0,96px); align-items:end; gap:16px; margin-bottom:8px; }
  .top-eyebrow { font-size:10px; letter-spacing:0.28em; text-transform:uppercase; color:${C.bih}; margin-bottom:14px; }
  #top h1 { font-family:'Fraunces',serif; font-weight:900; font-size:clamp(44px,9vw,96px); line-height:0.9; letter-spacing:-0.02em; margin-bottom:16px; }
  #top h1 em { font-style:italic; color:${C.bih}; font-weight:400; }
  .top-desc { font-size:14px; color:${C.sub}; max-width:480px; line-height:1.7; }
  .top-flag { align-self:flex-start; margin-top:6px; }
  #glance { margin:28px 0 8px; }
  .glance-eyebrow { font-size:10px; letter-spacing:0.28em; text-transform:uppercase; color:${C.sub}; margin-bottom:14px; }
  .glance-grid { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:3px; }
  .glance-tile { background:${C.bih}; border:1px solid ${C.border}; padding:14px 8px 12px; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; text-align:center; }
  .glance-tile-icon { margin-bottom:7px; line-height:1; }
  .glance-tile-label { font-size:8.5px; letter-spacing:0.08em; text-transform:uppercase; color:${C.txt}; margin-bottom:4px; }
  .glance-tile-value { font-family:'Fraunces',serif; font-weight:900; font-size:12px; color:${C.txt}; margin-bottom:3px; word-break:break-word; }
  .glance-tile-note { font-size:9px; color:${C.txt}; line-height:1.3; }
  .glance-map-tile { background:${C.card}; border:1px solid ${C.border}; padding:14px 12px 12px; position:relative; overflow:hidden; grid-column:span 4; }
  .glance-map-label { font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:${C.sub}; margin-bottom:8px; }
  .glance-map-container { position:relative; width:100%; aspect-ratio:16/9; overflow:hidden; border-radius:4px; }
  .glance-map-container svg { width:100%; height:100%; display:block; }
  .glance-map-loading { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:${C.sub}; font-size:11px; }
  .divider { height:1px; background:${C.border}; margin:14px 0; }
  #footer { padding:8px 0 0; margin-top:8px; }
  .footer-sources { font-size:10.5px; color:${C.faded}; line-height:1.7; }
  .footer-legal { font-size:9.5px; color:${C.dim}; margin-top:6px; line-height:1.6; text-align:center; }
  .timeline-item { padding-left:16px; border-left:1px solid ${C.bih}; margin-bottom:14px; }
  .timeline-year { font-size:10px; letter-spacing:0.11em; color:${C.yel}; text-transform:uppercase; margin-bottom:2px; }
  .country-row { display:flex; align-items:center; gap:10px; padding:9px 0; }
  .country-flag { font-size:18px; flex-shrink:0; }
  .country-name { font-size:12.5px; color:${C.txt}; flex-shrink:0; }
  .country-val { font-size:11px; color:${C.sub}; flex:1; }
  .country-pct { font-family:'Fraunces',serif; font-weight:700; font-size:13px; color:${C.txt}; flex-shrink:0; }
  .era-bar { display:flex; height:40px; border-radius:4px; overflow:hidden; }
  .era-seg { cursor:pointer; transition:background 0.2s; flex-shrink:0; border-right:1px solid ${C.bg}; }
  .era-labels { position:relative; height:28px; margin-top:5px; }
  .era-year-label { position:absolute; top:0; font-size:9px; color:${C.sub}; white-space:nowrap; writing-mode:vertical-lr; }
  .era-2025 { position:absolute; right:0; top:0; font-size:9px; color:${C.sub}; white-space:nowrap; writing-mode:vertical-lr; transform:scaleX(-1) scaleY(-1); }
  #era-placeholder { background:${C.bg}; border:1px solid ${C.border}; padding:8px 16px; border-radius:2px; margin-top:12px; font-size:11px; color:${C.sub}; text-align:center; }
  .era-panel { background:${C.bg}; border:1px solid ${C.border}; padding:16px 18px; border-radius:2px; margin-top:12px; }
  .era-panel-header { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; flex-wrap:wrap; gap:6px; }
  .era-year-range { font-size:10px; letter-spacing:0.15em; text-transform:uppercase; margin-bottom:3px; }
  .era-panel-label { font-family:'Fraunces',serif; font-weight:700; font-size:17px; color:${C.txt}; }
  .era-duration { font-family:'Fraunces',serif; font-weight:900; font-size:24px; opacity:0.4; }
  .era-desc { font-size:12px; color:${C.sub}; line-height:1.7; margin-bottom:12px; }
  .era-events { display:flex; flex-direction:column; gap:5px; }
  .era-event { display:flex; align-items:flex-start; gap:8px; }
  .era-bullet { width:4px; height:4px; border-radius:50%; margin-top:5px; flex-shrink:0; }
  .era-event-text { font-size:11.5px; color:${C.txt}; line-height:1.5; }
  .era-legend { display:flex; flex-wrap:wrap; gap:10px; margin-top:14px; }
  .era-leg { display:flex; align-items:center; gap:5px; cursor:pointer; }
  .era-swatch { width:8px; height:8px; border-radius:2px; flex-shrink:0; }
  .era-leg-lbl { font-size:10px; color:${C.sub}; letter-spacing:0.05em; }
`;

const Icons = {
  mountain:   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M256 32L32 480h448L256 32zm0 77l163 291H93L256 109z"/></svg>,
  map:        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 576 512" fill="currentColor"><path d="M384 476.1L192 421.2V35.9L384 90.8v385.3zm32-1.2V88.4l127.1-42.4c5.7-1.9 11.9.3 15.3 5.3 1.7 2.5 2.6 5.5 2.6 8.5V440c0 6.1-3.9 11.5-9.7 13.4L416 474.9zM15.7 56.4L160 10.7V98.6l-128 43.4V69c0-6.1 3.9-11.5 9.7-13.4zM192 421.2L32 474.9V138.7l160-54.2v336.7z"/></svg>,
  water:      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 576 512" fill="currentColor"><path d="M269.5 69.9c11.1-7.9 25.9-7.9 37 0C329 85.4 356.5 96 384 96c26.9 0 55.4-10.1 80.4-25.1 16-9.7 36.4-8.1 50.7 4.2s18.2 31.6 11.2 48.6C520.1 140 516 159 516 178c0 49.7 20 87.5 38.2 106.9l.4.4c17 18 22.4 44.5 13.4 67.8S536.6 391 511.4 391H64c-25.2 0-47.6-15.3-56.6-38.5s-3.6-49.8 13.4-67.8l.4-.4C39 265.5 59 227.7 59 178c0-18.4-3.4-36.3-9.9-52.4-7-17-2.9-36.3 11.2-48.6S105 62.9 121 72.9C146 87.9 173.1 96 200 96c27.5 0 55-10.6 77.5-26.1z"/></svg>,
  cloudSun:   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 640 512" fill="currentColor"><path d="M294.2 1.2c5.1 2.1 8.7 6.7 9.6 12.1l18.4 107.5 107.5 18.4c5.4.9 10 4.5 12.1 9.6s1.5 10.9-1.6 15.4l-62.3 90.3 46.5 60.7c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L301.7 358l-19.9 107.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L167.7 414l-90.4 62.2c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L33.6 358 1.2 294.2c-2.1-5-1.5-10.7 1.6-15.2L65 218.7 2.8 128.4c-3.1-4.5-3.7-10.2-1.6-15.4s6.7-8.7 12.1-9.6L121.8 85 140.2 13c1-5.4 4.5-10 9.6-12.1S160.5-.6 165 2.5L256 64.9 347 2.5c4.5-3.1 10.1-3.6 15.2-1.3z"/></svg>,
  sun:        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1-192 0z"/></svg>,
  rain:       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M96 320c-53 0-96-43-96-96 0-42.5 27.6-78.6 65.9-91.2C64.7 126.1 64 119.1 64 112 64 50.1 114.1 0 176 0c43.1 0 80.5 24.3 99.8 60 14.7-17.1 36.5-28 60.2-28 44.2 0 80 35.8 80 80 0 5.5-.6 10.8-1.6 16 .5 0 1.1 0 1.6 0 53 0 96 43 96 96s-43 96-96 96H96zm-8 96c0-13.3 10.7-24 24-24s24 10.7 24 24v80c0 13.3-10.7 24-24 24s-24-10.7-24-24v-80zm120-24c13.3 0 24 10.7 24 24v80c0 13.3-10.7 24-24 24s-24-10.7-24-24v-80c0-13.3 10.7-24 24-24zm96 24c0-13.3 10.7-24 24-24s24 10.7 24 24v80c0 13.3-10.7 24-24 24s-24-10.7-24-24v-80zm120-24c13.3 0 24 10.7 24 24v80c0 13.3-10.7 24-24 24s-24-10.7-24-24v-80c0-13.3 10.7-24 24-24z"/></svg>,
  people:     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 640 512" fill="currentColor"><path d="M72 88a56 56 0 1 1 112 0A56 56 0 1 1 72 88zM64 245.7C54 256.9 48 271.8 48 288s6 31.1 16 42.3V245.7zm144.4-49.3C178.7 222.7 160 261.2 160 304c0 34.3 12 65.8 32 90.5V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V389.2C26.2 371.2 0 332.7 0 288c0-61.9 50.1-112 112-112c29.3 0 56 11.3 75.9 29.7zM320 32a64 64 0 1 1 0 128A64 64 0 1 1 320 32zM448 304c0 44.7-26.2 83.2-64 101.2V448c0 17.7-14.3 32-32 32H288c-17.7 0-32-14.3-32-32V405.2c-37.8-18-64-56.5-64-101.2c0-61.9 50.1-112 112-112h32c61.9 0 112 50.1 112 112z"/></svg>,
  chart:      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V400c0 44.2 35.8 80 80 80H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16V64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z"/></svg>,
  briefcase:  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M184 48H328c4.4 0 8 3.6 8 8V96H176V56c0-4.4 3.6-8 8-8zm-56 8V96H64C28.7 96 0 124.7 0 160v96H192 320 512V160c0-35.3-28.7-64-64-64H384V56c0-30.9-25.1-56-56-56H184c-30.9 0-56 25.1-56 56zM512 288H320v32c0 17.7-14.3 32-32 32H224c-17.7 0-32-14.3-32-32V288H0V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V288z"/></svg>,
  graduation: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 640 512" fill="currentColor"><path d="M320 32c-8.1 0-16.1 1.4-23.7 4.1L25 155.5c-12.1 4.7-20 16.1-20 29.1s7.9 24.4 20 29.1l272.3 119.3c7.6 2.7 15.6 4.1 23.7 4.1s16.1-1.4 23.7-4.1L571.4 241c16.6-6.3 16.6-29.7 0-36L349.7 36.1c-7.6-2.7-15.6-4.1-23.7-4.1zM128 254.7V358c0 20.5 13.7 38.5 33.2 44.2l112.1 32c10.5 3 21.5 4.5 32.7 4.5s22.2-1.5 32.7-4.5l112.1-32c19.5-5.7 33.2-23.7 33.2-44.2V254.7L346.7 308c-8.3 3-17.3 4.5-26.7 4.5s-18.4-1.5-26.7-4.5L128 254.7z"/></svg>,
  landmark:   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M240.1 4.2c9.8-5.6 21.9-5.6 31.8 0l208 120c9.2 5.3 14.1 15.6 12.2 26.1s-10.4 18.5-21 18.5h-24.9L448 464H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H64L66.7 168.8H41.7c-10.6 0-19.2-7.9-21-18.5s3-20.8 12.2-26.1l208-120z"/></svg>,
};

const SectionHeader = ({ icon, label }) => (
  <div id="section" className="row my-3">
    <div className="col-12 d-flex align-items-center gap-2">
      <span className="section-icon">{icon}</span>
      <span className="section-title">{label}</span>
    </div>
  </div>
);

const Subnote = ({ children }) => (
  <p className="subnote">{children}</p>
);

const KpiCard = ({ label, value, sub, accent = C.bih, delay = 0 }) => {
  const valColor = accent === C.bih ? C.bihL : accent === C.yel ? C.yelL : accent === C.blu ? C.bluL : accent === C.red ? C.redL : C.txt;
  return (
    <div className="kpi" style={{ animationDelay:`${delay}s` }}>
      <div className="kpi-accent" style={{ background:accent }} />
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color:valColor }}>{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );
};

const Panel = ({ title, icon, note, children }) => (
  <div id="panel" className="panel">
    <div id="title" className="panel-title">
      <span className="panel-title-icon">{icon}</span>{title}
    </div>
    {children}
    {note && <Subnote>{note}</Subnote>}
  </div>
);

const BarRow = ({ label, value, pct, color = C.bih }) => (
  <div id="bar" className="bar">
    <div className="bar-header">
      <span className="bar-label">{label}</span>
      <span className="bar-value">{value}</span>
    </div>
    <div className="bar-track">
      <div className="bar-fill" style={{ width:`${pct}%`, background:color }} />
    </div>
  </div>
);

const Tbl = ({ rows }) => (
  <table id="paneltbl" className="tbl">
    <tbody>
      {rows.map((r, i) => (
        <tr key={i} style={{ borderBottom: i < rows.length-1 ? `1px solid ${C.border}` : 'none' }}>
          <td>{r.label}</td>
          <td>{r.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const RegCard = ({ name, type, desc, stripe }) => (
  <div className="regcard">
    <div className="regcard-stripe" style={{ background:stripe }} />
    <div className="regcard-name">{name}</div>
    <div className="regcard-type">{type}</div>
    <div className="regcard-desc">{desc}</div>
  </div>
);

const DlRow = ({ mo, label, pct, color = C.bih, dark = false }) => (
  <div className="dlrow">
    <span className="dlrow-mo">{mo}</span>
    <div className="dlrow-track">
      <div className="dlrow-fill" style={{ width:`${pct}%`, background:color }}>
        <span className="dlrow-label" style={{ color: dark ? C.bg : C.txt }}>{label}</span>
      </div>
    </div>
  </div>
);

/* ── Gradient Bar (temperature / rainfall / tourism timeline) ── */
const GradientBar = ({ title, values, colorStops, unit = '', height = 22, xLabels, fmt, invertPeak = false, absScale = false }) => {
  const defaultLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const labels = xLabels || defaultLabels;
  const n = values.length;
  const min = Math.min(...values), max = Math.max(...values);
  const absMax = Math.max(...values.map(Math.abs));
  const peakIdx = invertPeak ? values.indexOf(min) : values.indexOf(max);
  // absScale: color intensity based on distance from zero (most extreme = most saturated)
  const pct = v => absScale ? (Math.abs(v) / absMax) * 100 : ((v - min) / (max - min)) * 100;
  const gradient = values.map((v, i) => {
    const p = pct(v);
    return `${colorStops(p, v)} ${(i / (n - 1)) * 100}%`;
  }).join(', ');
  // peak = most extreme absolute value
  const peakIdx2 = absScale ? values.reduce((a,b,i,arr) => Math.abs(arr[i]) > Math.abs(arr[a]) ? i : a, 0) : peakIdx;
  const usePeakIdx = absScale ? peakIdx2 : peakIdx;
  const peakPct = (usePeakIdx / (n - 1)) * 100;
  const labelColor = C.sub;
  const peakColor = colorStops(100, absScale ? values[usePeakIdx] : (invertPeak ? min : max)).replace(/rgb\((\d+),(\d+),(\d+)\)/, (_, r, g, b) => `rgb(${Math.round(r*0.45)},${Math.round(g*0.45)},${Math.round(b*0.45)})`);
  return (
    <div style={{ marginTop:14 }}>
      {title && <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>{title}</div>}
      <div style={{ position:'relative', height, borderRadius:4, overflow:'hidden', background:`linear-gradient(to right, ${gradient})` }}>
        <div style={{ position:'absolute', top:'10%', bottom:'10%', left:`${peakPct}%`, width:1, background:peakColor, transform:'translateX(-50%)', borderRadius:1 }} />
      </div>
      <div style={{ display:'flex', marginTop:4 }}>
        {labels.map((l, i) => (
          <div key={l} style={{ textAlign:'center', flex:1 }}>
            <div style={{ fontSize:8, color: i===usePeakIdx ? C.txt : labelColor, fontWeight: i===usePeakIdx ? 600 : 300, lineHeight:1 }}>{l}</div>
            <div style={{ fontSize:8, color: i===usePeakIdx ? C.txt : labelColor, lineHeight:1.4 }}>{fmt ? fmt(values[i]) : `${values[i]}${unit}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Donut = ({ segments, label, sublabel, size = 160 }) => {
  const r = 54, cx = 80, cy = 80, stroke = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = segments.map(s => {
    const dash = (s.pct / 100) * circ;
    const gap  = circ - dash;
    const rot  = (offset / 100) * 360 - 90;
    offset += s.pct;
    return { ...s, dash, gap, rot };
  });
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
      <div style={{ position:'relative', flexShrink:0 }}>
        <svg width={size} height={size} viewBox="0 0 160 160">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.track} strokeWidth={stroke} />
          {slices.map((s, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={0}
              transform={`rotate(${s.rot} ${cx} ${cy})`}
            />
          ))}
        </svg>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
          <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:22, lineHeight:1, color:C.txt }}>{label}</div>
          {sublabel && <div style={{ fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginTop:3 }}>{sublabel}</div>}
        </div>
      </div>
      <div style={{ flex:1, minWidth:120 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:s.color, flexShrink:0 }} />
            <span style={{ fontSize:11, color:C.sub, flex:1, lineHeight:1.3 }}>{s.label}</span>
            <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:12, color:C.txt }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Bosnia and Herzegovina flag — source: Wikimedia Commons (public domain) */
const Flag = () => (
  <div style={{ width:90, height:45, borderRadius:3, overflow:'hidden',
    boxShadow:`0 4px 24px ${C.bihS}`, flexShrink:0, position:'relative' }}>
    <svg width="90" height="45" viewBox="0 0 16 8" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <rect width="16" height="8" fill="#002395"/>
      <path d="m4.24,0h8v8z" fill="#fecb00"/>
      <g id="bih-sg">
        <path id="bih-s" d="M2.353283,0.5248529 2.8,-0.85 3.246717,0.524853 2.077197,-0.324853H3.522803z" fill="#fff"/>
        <use xlinkHref="#bih-s" x="1" y="1"/>
        <use xlinkHref="#bih-s" x="2" y="2"/>
      </g>
      <use xlinkHref="#bih-sg" x="3" y="3"/>
      <use xlinkHref="#bih-sg" x="6" y="6"/>
    </svg>
  </div>
);

export default function BosniaAndHerzegovina() {
  useEffect(() => {
    if (!document.getElementById('bs-cdn')) {
      const l = document.createElement('link');
      l.id='bs-cdn'; l.rel='stylesheet';
      l.href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
      document.head.appendChild(l);
    }
  }, []);

  return (
    <>
      <style>{css}</style>
      <div className="dash">

        {/* TOP */}
        <div id="top">
          <div>
            <div className="top-eyebrow">Country Dashboard 2025</div>
            <h1>
              Bosnia and <em>Herzegovina</em>
            </h1>
            <p className="top-desc">
              A comprehensive data snapshot — geography, climate, population, economy, employment, education and politics — sourced from the Agency for Statistics of Bosnia and Herzegovina, World Bank, IMF, and UN agencies.
            </p>
          </div>
          <div className="top-flag"><Flag /></div>
        </div>

        {/* ── AT A GLANCE ── */}
        {(() => {
          const col = C.bih;
          const mapRef = React.useRef(null);
          const [mapLoaded, setMapLoaded] = React.useState(false);

          React.useEffect(() => {
            let cancelled = false;
            async function drawMap() {
              try {
                if (!document.getElementById('d3-cdn')) {
                  await new Promise((res, rej) => {
                    const s = document.createElement('script'); s.id='d3-cdn';
                    s.src='https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
                    s.onload=res; s.onerror=rej; document.head.appendChild(s);
                  });
                }
                if (!document.getElementById('topo-cdn')) {
                  await new Promise((res, rej) => {
                    const s = document.createElement('script'); s.id='topo-cdn';
                    s.src='https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js';
                    s.onload=res; s.onerror=rej; document.head.appendChild(s);
                  });
                }
                const world = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json').then(r=>r.json());
                if (cancelled) return;
                const d3=window.d3, topojson=window.topojson;
                const countries=topojson.feature(world,world.objects.countries);
                const W=960,H=540,BIH=70;
                const proj=d3.geoMercator().center([17.5,44.0]).scale(5500).translate([W/2,H/2]);
                const path=d3.geoPath().projection(proj);
                const svg=d3.select(mapRef.current);
                svg.selectAll('*').remove();
                svg.append('rect').attr('width',W).attr('height',H).attr('fill',C.sea);
                svg.append('g').selectAll('path').data(countries.features).join('path')
                  .attr('d',path).attr('fill',d=>+d.id===BIH?C.bih:C.land)
                  .attr('stroke',C.txt).attr('stroke-width',0.3);
                const bihF=countries.features.find(d=>+d.id===BIH);
                if(bihF) svg.append('path').datum(bihF).attr('d',path).attr('fill',C.bih).attr('stroke',C.txt).attr('stroke-width',0.8);
                const labels=[
                  {name:'CROATIA',x:180,y:175},{name:'SERBIA',x:710,y:280},
                  {name:'MONTENEGRO',x:575,y:450},{name:'SLOVENIA',x:85,y:95}
                ];
                labels.forEach(({name,x,y})=>{
                  svg.append('text').attr('x',x).attr('y',y).attr('text-anchor','middle')
                    .attr('fill',C.txt).attr('font-size',12).attr('font-family','Inter,sans-serif')
                    .attr('letter-spacing',2).text(name);
                });
                const [ax,ay]=proj([18.42,43.85]);
                svg.append('circle').attr('cx',ax).attr('cy',ay).attr('r',6).attr('fill',C.capital).attr('opacity',0.2);
                svg.append('circle').attr('cx',ax).attr('cy',ay).attr('r',3.5).attr('fill',C.capital);
                svg.append('text').attr('x',ax+8).attr('y',ay+4).attr('fill',C.capital)
                  .attr('font-size',22).attr('font-family','Inter,sans-serif').attr('font-weight',500).text('Sarajevo');
                if(!cancelled) setMapLoaded(true);
              } catch(e){console.error('map',e);}
            }
            drawMap();
            // Set up timeline clicks after render
            var ERA_COLORS = ERAS.data.map(function(e){ return { color: e.color, colorL: e.colorL }; });
            var ERA_COUNT = ERAS.data.length;
            var active = null;
            function selectEra(i) {
              var segs = document.querySelectorAll('.era-seg');
              var legs = document.querySelectorAll('.era-leg-lbl');
              if (active === i) { i = null; }
              var ph = document.getElementById('era-placeholder');
              if (ph) ph.style.display = (i === null) ? 'block' : 'none';
              for (var k = 0; k < ERA_COUNT; k++) {
                var p = document.getElementById('era-panel-' + k);
                if (p) p.style.display = (k === i) ? 'block' : 'none';
                if (segs[k]) segs[k].style.background = (k === i) ? ERA_COLORS[k].colorL : ERA_COLORS[k].color;
                if (legs[k]) legs[k].style.color = (k === i) ? ERA_COLORS[k].colorL : C.sub;
              }
              active = i;
            }
            document.querySelectorAll('.era-seg').forEach(function(el) {
              el.addEventListener('click', function(){ selectEra(parseInt(el.getAttribute('data-era'))); });
            });
            document.querySelectorAll('.era-leg').forEach(function(el) {
              el.addEventListener('click', function(){ selectEra(parseInt(el.getAttribute('data-era'))); });
            });
            return ()=>{cancelled=true;};
          }, []);

          return (
            <div id="glance">
              <div className="glance-eyebrow">At a glance</div>
              <div className="glance-grid">
                {TILES.map(({ icon, label, value, note }) => (
                  <div key={label} className="glance-tile">
                    <div className="glance-tile-icon">{icon}</div>
                    <div className="glance-tile-label">{label}</div>
                    <div className="glance-tile-value">{value}</div>
                    <div className="glance-tile-note">{note}</div>
                  </div>
                ))}
                {/* Map tile */}
                <div className="glance-map-tile">
                  <div className="glance-map-label">Shape & Location</div>
                  <div className="glance-map-container">
                    <svg ref={mapRef} viewBox="0 0 960 540" />
                    {!mapLoaded && <div className="glance-map-loading">Loading map…</div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 1. GEOGRAPHY */}
        <SectionHeader icon={Icons.mountain} label="Geography & Landscape" />

        <div id="item" className="row g-1 mb-3">
          {GEO.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>

        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={GEO_TERRAIN.title} icon={Icons.map} note={GEO_TERRAIN.note}>
              {GEO_TERRAIN.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={GEO_WATER.title} icon={Icons.water} note={GEO_WATER.note}>
              <Tbl rows={GEO_WATER.data} />
            </Panel>
          </div>
        </div>

        <div id="item" className="row g-1 mb-3">
          {GEO_REGIONS.map(r => <div key={r.name} className="col-6 col-md-3 d-flex"><RegCard name={r.name} type={r.type} desc={r.desc} stripe={r.stripe} /></div>)}
        </div>

        {/* 2. CLIMATE */}
        <SectionHeader icon={Icons.cloudSun} label="Climate: Weather, Daylight & Rainfall" />
        <div id="item" className="row g-1 mb-4">
          {CLIMA_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={CLIMA_DAYLIGHT.title} icon={Icons.sun} note={CLIMA_DAYLIGHT.note}>
              {CLIMA_DAYLIGHT.data.map(r => <DlRow key={r.mo} mo={r.mo} label={r.label} pct={r.pct} color={r.color || C.bih} dark={r.dark} />)}
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={CLIMA_RAIN_REGIONAL.title} icon={Icons.rain} note={CLIMA_RAIN_SEASONAL.note}>
              <p className="panel-sublabel">{CLIMA_RAIN_REGIONAL.sublabel}</p>
              {CLIMA_RAIN_REGIONAL.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
              <div className="divider" />
              <p className="panel-sublabel">{CLIMA_RAIN_SEASONAL.sublabel}</p>
              {CLIMA_RAIN_SEASONAL.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
              <GradientBar {...CLIMA_RAIN_SEASONAL.gradbar1} />
              <GradientBar {...CLIMA_RAIN_SEASONAL.gradbar2} />
            </Panel>
          </div>
        </div>

        {/* 3. POPULATION */}
        <SectionHeader icon={Icons.people} label="Population & Demographics" />
        <div id="item" className="row g-1 mb-3">
          {POP_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={POP_GROWTH.title} icon={Icons.chart} note={POP_GROWTH.note}>
              {POP_GROWTH.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={POP_CITIES.title} icon={Icons.landmark} note={POP_CITIES.note}>
              {POP_CITIES.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={POP_ETHNIC.title} icon={Icons.people} note={POP_ETHNIC.note}>
              <Donut label={POP_ETHNIC.label} sublabel={POP_ETHNIC.sublabel} segments={POP_ETHNIC.data} />
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={POP_RELIGION.title} icon={Icons.landmark} note={POP_RELIGION.note}>
              <Tbl rows={POP_RELIGION.data} />
            </Panel>
          </div>
        </div>

        {/* 4. ECONOMY */}
        <SectionHeader icon={Icons.chart} label="Economy & Finance" />
        <div id="item" className="row g-1 mb-3">
          {ECON_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={ECON_GDP_DONUT.title} icon={Icons.chart} note={ECON_EXPORTS_BARS.note}>
              <Donut label={ECON_GDP_DONUT.label} sublabel={ECON_GDP_DONUT.sublabel} segments={ECON_GDP_DONUT.data} />
              <div className="divider" />
              {ECON_EXPORTS_BARS.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={ECON_INDICATORS.title} icon={Icons.briefcase} note={ECON_INDICATORS.note}>
              <Tbl rows={ECON_INDICATORS.data} />
            </Panel>
          </div>
        </div>

        {/* 5. EMPLOYMENT */}
        <SectionHeader icon={Icons.briefcase} label="Employment & Wages" />
        <div id="item" className="row g-1 mb-3">
          {EMP_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={EMP_WAGES.title} icon={Icons.chart} note={EMP_WAGES.note}>
              {EMP_WAGES.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={EMP_SECTORS_DONUT.title} icon={Icons.briefcase} note={EMP_MIGRATION.note}>
              <Donut label={EMP_SECTORS_DONUT.label} sublabel={EMP_SECTORS_DONUT.sublabel} segments={EMP_SECTORS_DONUT.data} />
              <div className="divider" />
              <Tbl rows={EMP_MIGRATION.data} />
            </Panel>
          </div>
        </div>

        {/* 6. EDUCATION */}
        <SectionHeader icon={Icons.graduation} label="Education & Human Development" />
        <div id="item" className="row g-1 mb-3">
          {EDU_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={EDU_METRICS.title} icon={Icons.graduation} note={EDU_METRICS.note}>
              {EDU_METRICS.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={EDU_FACTS.title} icon={Icons.landmark} note={EDU_FACTS.note}>
              <Tbl rows={EDU_FACTS.data} />
            </Panel>
          </div>
        </div>

        {/* 7. POLITICAL */}
        <SectionHeader icon={Icons.landmark} label="Political Landscape" />
        <div id="item" className="row g-1 mb-3">
          {POL_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={POL_ELECTION.title} icon={Icons.landmark} note={POL_ELECTION.note}>
              {POL_ELECTION.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={POL_TIMELINE.title} icon={Icons.chart} note={POL_TIMELINE.note}>
              {POL_TIMELINE.data.map(({ yr, tx }) => (
                <div key={yr} className="timeline-item">
                  <div className="timeline-year">{yr}</div>
                  <div className="subnote">{tx}</div>
                </div>
              ))}
            </Panel>
          </div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12">
            <Panel title={ERAS.title} icon={Icons.chart} note={ERAS.note}>

              {/* Era bar — data-era index used by vanilla JS below */}
              <div className="era-bar">
                {ERAS.data.map((era, i) => (
                  <div key={era.key}
                    data-era={i}
                    className="era-seg"
                    title={`${era.label} (${era.start}–${era.end})`}
                    style={{ width:`${((era.end - era.start) / ERA_TOTAL) * 100}%`, background:era.color }}
                  />
                ))}
              </div>

              {/* Year labels — % positions match bar since gap removed */}
              <div className="era-labels">
                {ERAS.data.map((era, i) => {
                  const left = ((era.start - 1878) / ERA_TOTAL) * 100;
                  const isFirst = i === 0;
                  return (
                    <div key={era.key} className="era-year-label"
                      style={{ left:`${left}%`, transform: isFirst ? 'scaleX(-1) scaleY(-1)' : 'translateX(-50%) scaleX(-1) scaleY(-1)' }}>
                      {era.start}
                    </div>
                  );
                })}
                <div className="era-2025">2025</div>
              </div>

              {/* Placeholder shown when nothing selected */}
              <div id="era-placeholder">
                Click any era above to see details and key events.
              </div>

              {/* All era detail panels — hidden by default, shown by JS */}
              {ERAS.data.map((era, i) => (
                <div key={era.key} id={`era-panel-${i}`} className="era-panel"
                  style={{ display:'none', borderLeft:`3px solid ${era.color}` }}>
                  <div className="era-panel-header">
                    <div>
                      <div className="era-year-range" style={{ color:era.colorL }}>{era.start} – {era.end}</div>
                      <div className="era-panel-label">{era.label}</div>
                    </div>
                    <div className="era-duration" style={{ color:era.color }}>{era.end - era.start}y</div>
                  </div>
                  <p className="era-desc">{era.desc}</p>
                  <div className="era-events">
                    {era.events.map((ev, j) => (
                      <div key={j} className="era-event">
                        <div className="era-bullet" style={{ background:era.colorL }} />
                        <div className="era-event-text">{ev}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="era-legend">
                {ERAS.data.map((era, i) => (
                  <div key={era.key} data-era={i} className="era-leg">
                    <div className="era-swatch" style={{ background:era.color }} />
                    <span className={`era-leg-lbl era-leg-lbl-${i}`}>{era.short}</span>
                  </div>
                ))}
              </div>

            </Panel>
          </div>
        </div>

        {/* 8. TOURISM */}
        <SectionHeader icon={Icons.briefcase} label="Tourism" />
        <div id="item" className="row g-1 mb-3">
          {TOUR_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={TOUR_ORIGINS.title} icon={Icons.people} note={TOUR_ORIGINS.note}>
              {TOUR_ORIGINS.data.map(({ flag, country, val, pct }) => (
                <div key={country} className="country-row">
                  <span className="country-flag">{flag}</span>
                  <span className="country-name">{country}</span>
                  <span className="country-val">{val}</span>
                  <span className="country-pct">{pct}</span>
                </div>
              ))}
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={TOUR_HIGHLIGHTS.title} icon={Icons.landmark} note={TOUR_HIGHLIGHTS.note}>
              <Tbl rows={TOUR_HIGHLIGHTS.data} />
              <GradientBar {...TOUR_HIGHLIGHTS.gradbar} />
            </Panel>
          </div>
        </div>

        {/* 9. VITAL STATISTICS */}
        <SectionHeader icon={Icons.people} label="Vital Statistics" />
        <div id="item" className="row g-1 mb-3">
          {VITA_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={VITA_DEATHS.title} icon={Icons.chart} note={VITA_DEATHS.note}>
              {VITA_DEATHS.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={VITA_TRENDS.title} icon={Icons.landmark} note={VITA_TRENDS.note}>
              <Tbl rows={VITA_TRENDS.data} />
            </Panel>
          </div>
        </div>
        <div id="item" className="row g-1 mb-3">
          {HEALTH_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={HEALTH_FACTS.title} icon={Icons.people} note={HEALTH_FACTS.note}>
              <Tbl rows={HEALTH_FACTS.data} />
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={HEALTH_BURDEN.title} icon={Icons.chart} note={HEALTH_BURDEN.note}>
              {HEALTH_BURDEN.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
        </div>

        {/* 10. ENERGY */}
        <SectionHeader icon={Icons.mountain} label="Energy & Resources" />
        <div id="item" className="row g-1 mb-3">
          {ENERGY_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={ENERGY_MIX.title} icon={Icons.chart} note={ENERGY_MIX.note}>
              <Donut label={ENERGY_MIX.label} sublabel={ENERGY_MIX.sublabel} segments={ENERGY_MIX.data} />
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={ENERGY_FACTS.title} icon={Icons.landmark} note={ENERGY_FACTS.note}>
              <Tbl rows={ENERGY_FACTS.data} />
            </Panel>
          </div>
        </div>

        {/* 11. INFRASTRUCTURE */}
        <SectionHeader icon={Icons.map} label="Infrastructure & Digital Connectivity" />
        <div id="item" className="row g-1 mb-3">
          {INFRA_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={INFRA_PROJECTS.title} icon={Icons.map} note={INFRA_PROJECTS.note}>
              <Tbl rows={INFRA_PROJECTS.data} />
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={INFRA_DIGITAL.title} icon={Icons.chart} note={INFRA_DIGITAL.note}>
              {INFRA_DIGITAL.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
        </div>

        {/* 12. GENDER & SOCIETY */}
        <SectionHeader icon={Icons.people} label="Social Indicators & Inequality" />
        <div id="item" className="row g-1 mb-3">
          {SOCIAL_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={SOCIAL_SERVICES.title} icon={Icons.chart} note={SOCIAL_SERVICES.note}>
              {SOCIAL_SERVICES.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={SOCIAL_COHESION.title} icon={Icons.people} note={SOCIAL_COHESION.note}>
              <Tbl rows={SOCIAL_COHESION.data} />
            </Panel>
          </div>
        </div>

        {/* 13. ENVIRONMENT */}
        <SectionHeader icon={Icons.water} label="Environment" />
        <div id="item" className="row g-1 mb-3">
          {ENV_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={ENV_FACTS.title} icon={Icons.water} note={ENV_FACTS.note}>
              <Tbl rows={ENV_FACTS.data} />
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={ENV_WATER.title} icon={Icons.chart} note={ENV_WATER.note}>
              {ENV_WATER.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
        </div>

        {/* 14. BUSINESS */}
        <SectionHeader icon={Icons.briefcase} label="Business & Investment" />
        <div id="item" className="row g-1 mb-3">
          {BIZ_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={BIZ_CLIMATE.title} icon={Icons.briefcase} note={BIZ_CLIMATE.note}>
              <Tbl rows={BIZ_CLIMATE.data} />
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={BIZ_RISKS.title} icon={Icons.chart} note={BIZ_RISKS.note}>
              {BIZ_RISKS.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
        </div>

        <div id="item" className="row g-1 mb-3">
          {FISCAL_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={FISCAL_EXPORTS.title} icon={Icons.briefcase} note={FISCAL_EXPORTS.note}>
              {FISCAL_EXPORTS.data.map(({ flag, country, val, pct }) => (
                <div key={country} className="country-row">
                  <span className="country-flag">{flag}</span>
                  <span className="country-name">{country}</span>
                  <span className="country-val">{val}</span>
                  <span className="country-pct">{pct}</span>
                </div>
              ))}
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={FISCAL_INDICATORS.title} icon={Icons.chart} note={FISCAL_INDICATORS.note}>
              <Tbl rows={FISCAL_INDICATORS.data} />
              <GradientBar {...FISCAL_INDICATORS.gradbar} />
            </Panel>
          </div>
        </div>

        {/* 15. CRIME & SECURITY */}
        <SectionHeader icon={Icons.landmark} label="Crime & Security" />
        <div id="item" className="row g-1 mb-3">
          {CRIME_KPI.map(k => <div key={k.label} className="col-6 col-md-4 d-flex"><KpiCard label={k.label} value={k.value} sub={k.sub} accent={k.accent} delay={k.delay} /></div>)}
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title={CRIME_INDICATORS.title} icon={Icons.landmark} note={CRIME_INDICATORS.note}>
              <Tbl rows={CRIME_INDICATORS.data} />
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title={CRIME_SECURITY.title} icon={Icons.chart} note={CRIME_SECURITY.note}>
              {CRIME_SECURITY.data.map(r => <BarRow key={r.label} label={r.label} value={r.value} pct={r.pct} color={r.color} />)}
            </Panel>
          </div>
        </div>

        <div id="footer">
          <p className="footer-sources">
            Sources: Agency for Statistics of Bosnia and Herzegovina · World Bank 2024 · IMF WEO 2025 · UNDP HDR 2025 · Transparency International CPI 2025 · WHO · IEP GPI 2024 · RSF Press Freedom 2024 · World Justice Project 2024 · Freedom House 2025 · ILO · Open-Meteo · Data as of [Month Year].
          </p>
          <p className="footer-legal">
            Generated June 2026 · Claude Sonnet 4.6 (Anthropic) · iAlmirPro
          </p>
        </div>

      </div>
    </>
  );
}
