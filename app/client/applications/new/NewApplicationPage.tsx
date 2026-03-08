'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import PageShell from '@/components/PageShell'

interface Profile { id: string; full_name: string; city: string; package_type: string }

// ─── CITIES ──────────────────────────────────────────────────────────────────
const CITIES = [
  'Prishtinë','Prizren','Pejë','Gjakovë','Mitrovicë','Gjilan',
  'Ferizaj','Vushtrri','Skenderaj','Lipjan','Podujevë','Klinë',
  'Istog','Rahovec','Malishevë','Suharekë','Dragash','Deçan','Junik','Hani i Elezit',
]

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:'banjo',      name:'Banjo & Sanitare',    icon:'🚿', color:'#3b82f6', bg:'rgba(59,130,246,0.1)',  desc:'Kafelizhim, sanitar, hidraulikë' },
  { id:'kuzhine',    name:'Kuzhinë',              icon:'🍳', color:'#f59e0b', bg:'rgba(245,158,11,0.1)',  desc:'Kabinete, sipërfaqe, instalime' },
  { id:'ngjyrosje',  name:'Ngjyrosje & Suvatime', icon:'🎨', color:'#8b5cf6', bg:'rgba(139,92,246,0.1)',  desc:'Brendshme dhe jashtme' },
  { id:'dysheme',    name:'Dysheme & Pllaka',     icon:'🪵', color:'#d97706', bg:'rgba(217,119,6,0.1)',   desc:'Parket, pllaka, vinyl' },
  { id:'elektrike',  name:'Elektrike',            icon:'⚡', color:'#eab308', bg:'rgba(234,179,8,0.1)',   desc:'Instalim, panel, ndriçim' },
  { id:'hidraulike', name:'Hidraulikë',            icon:'🔧', color:'#06b6d4', bg:'rgba(6,182,212,0.1)',   desc:'Tuba, radiatorë, bojler' },
  { id:'ndertim',    name:'Ndërtim & Strukturë',  icon:'🏗️', color:'#94a3b8', bg:'rgba(148,163,184,0.1)', desc:'Mure, shtylla, beton' },
  { id:'dyer',       name:'Dyer & Dritare',        icon:'🪟', color:'#10b981', bg:'rgba(16,185,129,0.1)',  desc:'PVC, alumin, dru' },
  { id:'fasada',     name:'Fasadë & Eksterier',    icon:'🏠', color:'#e8621a', bg:'rgba(232,98,26,0.1)',   desc:'Izolim, suvatim, ngjyrosje' },
  { id:'ngrohje',    name:'Ngrohje & Klimë',       icon:'🌡️', color:'#ef4444', bg:'rgba(239,68,68,0.1)',   desc:'Central, kondicioner, panele' },
  { id:'oborr',      name:'Oborr & Rrethojë',      icon:'🌿', color:'#22c55e', bg:'rgba(34,197,94,0.1)',   desc:'Rregullim, gardh, kalldrëm' },
  { id:'tjeter',     name:'Tjetër / I përgjithshëm',icon:'🔨', color:'#a78bfa', bg:'rgba(167,139,250,0.1)', desc:'Shërbime të tjera' },
] as const
type CatId = typeof CATEGORIES[number]['id']

// ─── CATEGORY FIELD TYPES ─────────────────────────────────────────────────────
type FieldType = 'number'|'text'|'textarea'|'chips'|'chips_multi'|'toggle_group'|'slider'|'select'

interface Field {
  key:          string
  label:        string
  type:         FieldType
  required?:    boolean
  options?:     string[]
  placeholder?: string
  hint?:        string
  icon?:        string
  unit?:        string
  min?:         number
  max?:         number
  dependsOn?:   string   // show only if this key has a value
  dependsVal?:  string   // specific value to match
  section?:     string   // section header above this field
}

// ─── CATEGORY-SPECIFIC FIELDS ─────────────────────────────────────────────────
const CAT_FIELDS: Record<CatId, Field[]> = {

  // ────────────────────────────── BANJO ──────────────────────────────────────
  banjo: [
    { key:'job_scope',         label:'Çfarë do të bëhet?',              type:'chips_multi', required:true, icon:'🔍',
      options:['Kafelizhim i plotë','Zëvendësim sanitarësh','Hidraulikë e re','Instalim elektrik','Nivelim & suvatim','Shembje & rindërtim i plotë'], section:'Shtrirja e punës' },
    { key:'tiles_wall_m2',     label:'Sipërfaqja kafelive — mure (m²)', type:'number', required:true, icon:'📐', placeholder:'p.sh. 18', hint:'Mat gjatësinë × lartësinë e çdo muri' },
    { key:'tiles_floor_m2',    label:'Sipërfaqja kafelive — dysheme (m²)',type:'number', required:true, icon:'📐', placeholder:'p.sh. 6' },
    { key:'tile_size',         label:'Formati i kafelit të dëshiruar',   type:'chips', icon:'🔲',
      options:['60×60 cm','60×120 cm','30×60 cm','Mozaik','Large format (80×160+)','Çdo format'] },
    { key:'shower_or_bath',    label:'Dush apo vaskë?',                  type:'chips', required:true, icon:'🛁',
      options:['Kabinë dushi','Vaskë e lirë','Vaskë me brisk','Vaskë built-in','Dush walk-in pa derë','Të dyja'], section:'Sanitarë' },
    { key:'wc_type',           label:'Tipi i WC-it',                    type:'chips', icon:'🚽',
      options:['WC pezulluar (rimless)','WC dyshemeje','Bidet i integruar','Bidet i veçantë'] },
    { key:'sink_type',         label:'Lavamani',                        type:'chips', icon:'🪣',
      options:['Nën-sipërfaqe (undermount)','Mbi-sipërfaqe (vessel)','Semi-recess','Lavaman kolonë','Lavaman dyfishe'] },
    { key:'faucet_finish',     label:'Përfundimi i baterive',           type:'chips', icon:'✨',
      options:['Krom','Nikël i brushuar','Mat e zezë','Ari/bronz','Inoks'], section:'Stili' },
    { key:'style',             label:'Stili i preferuar',               type:'chips', icon:'🎨',
      options:['Modern & Minimalist','Industrial','Skandinav','Glamour/Luksoze','Natyror (gur/dru)','Klasik/Traditional'] },
    { key:'has_window',        label:'Ka dritare banjoje?',             type:'chips', icon:'🪟', options:['Po','Jo'] },
    { key:'needs_ventilation', label:'Nevojitet ventilim?',             type:'chips', icon:'💨', options:['Po','Jo'], section:'Teknikë' },
    { key:'heated_towel_rail', label:'Radiator peshqirësh?',            type:'chips', icon:'♨️', options:['Po','Jo'] },
    { key:'waterproofing',     label:'Hidroizolim nën kafele?',         type:'chips', required:true, icon:'💧', options:['Po (i detyrueshëm)','Jo (ka ekzistues)','Nuk e di'] },
    { key:'current_state',     label:'Gjendja aktuale e banjës',        type:'chips', required:true, icon:'🏚️',
      options:['E vjetër (rinovim)','E dëmtuar rëndë','Ndërtim i ri — pa asgjë','Vetëm kozmetik'], section:'Situata' },
    { key:'floor_number',      label:'Kati i banesës',                  type:'number', icon:'🏢', placeholder:'p.sh. 3', hint:'Ndikon në çmimin e transportit materialeve' },
  ],

  // ────────────────────────────── KUZHINE ────────────────────────────────────
  kuzhine: [
    { key:'job_scope',            label:'Çfarë do të bëhet?',           type:'chips_multi', required:true, icon:'🔍',
      options:['Kabinete të reja','Sipërfaqe (countertop)','Aparatura & instalim','Hidraulikë e re','Instalim elektrik','Demolim i plotë & rindërtim'], section:'Shtrirja e punës' },
    { key:'cabinet_linear_m',     label:'Gjatësia totale e kabineve (m)',type:'number', required:true, icon:'📏', placeholder:'p.sh. 5.5', hint:'Mat çdo segment muri me kabinete, bishtagoji' },
    { key:'cabinet_height',       label:'Lartësia kabineve sipër (cm)', type:'chips', icon:'📐',
      options:['60 cm (standard)','72 cm','90 cm','Deri në tavan'] },
    { key:'countertop_material',  label:'Materiali i sipërfaqes',       type:'chips', required:true, icon:'🪨',
      options:['Granit natyral','Mermer natyral','Quartz (Silestone/Caesarstone)','Laminat HPL','Kompakt (Dekton/Neolith)','Inoks','Beton i armuar'] },
    { key:'countertop_thickness', label:'Trashësia countertop (mm)',    type:'chips', icon:'📐',
      options:['12 mm','20 mm','30 mm','40 mm (luxe)'] },
    { key:'style',                label:'Stili i preferuar',            type:'chips', required:true, icon:'🎨',
      options:['Modern/Minimalist','Shaker klasik','Industrial','Skandinav','Rustik/Natyror','Gloss i lartë'], section:'Dizajn' },
    { key:'handle_type',          label:'Tipi i dorezave',              type:'chips', icon:'👆',
      options:['Pa doreza (Push-to-open / J-pull)','G-profil','Doreza horizontale','Doreza vertikale (bar)','Integrohet me kornizë'] },
    { key:'island',               label:'Island / ishull kuzhine?',     type:'chips', icon:'🏝️', options:['Po','Jo'] },
    { key:'island_size',          label:'Dimensionet e islandit',       type:'text', icon:'📐', placeholder:'p.sh. 120×80 cm', dependsOn:'island', dependsVal:'Po' },
    { key:'appliances',           label:'Aparatura të përfshira?',      type:'chips_multi', icon:'🔌',
      options:['Sobë/Furrë','Kapak gatimi (hob)','Frigorifer','Lavastovilje','Mikrovalonë','Kapak oxhaku (hood)','Lavatrice e integruar'], section:'Aparatura' },
    { key:'needs_plumbing',       label:'Hidraulikë e re?',             type:'chips', required:true, icon:'🔧', options:['Po','Jo'] },
    { key:'needs_electric',       label:'Pika elektrike shtesë?',       type:'chips', required:true, icon:'⚡', options:['Po','Jo'] },
    { key:'backsplash',           label:'Backsplash (muri prapa countertop)?',type:'chips', icon:'🧱',
      options:['Kafele','Xham i shkëlqyer','Panele inoks','Mermer/Quartz i njëjtë','Pa backsplash'], section:'Detaje' },
    { key:'lighting',             label:'Ndriçim nën kabinete?',        type:'chips', icon:'💡', options:['Po (LED strip)','Jo'] },
  ],

  // ────────────────────────────── NGJYROSJE ──────────────────────────────────
  ngjyrosje: [
    { key:'scope',               label:'Çfarë do të ngjyroset?',       type:'chips_multi', required:true, icon:'🎨',
      options:['Muret brendshëm','Tavani','Fasada e jashtme','Suvatime dhe nivelim para ngjyrosjes','Dyer & korniza','Radiatorë & tuba'], section:'Shtrirja' },
    { key:'total_wall_m2',       label:'Sipërfaqja totale e mureve (m²)',type:'number', required:true, icon:'📐', placeholder:'p.sh. 280', hint:'Gjatësia × lartësia për çdo dhomë, hiqni dyert+dritaret' },
    { key:'rooms_breakdown',     label:'Numri i dhomave',               type:'chips', icon:'🏠',
      options:['1 dhomë','2 dhoma','3 dhoma','4 dhoma','5+ dhoma','E gjithë banesa/zyra'] },
    { key:'ceiling_height',      label:'Lartësia e tavanit',            type:'chips', icon:'📏',
      options:['Deri 2.7m','2.7–3.2m','3.2–4m','Mbi 4m (nevojitet skelë)'] },
    { key:'surface_condition',   label:'Gjendja e mureve tani',         type:'chips_multi', required:true, icon:'🔍',
      options:['Të shëndetshëm (vetëm ngjyrosje)','Çarje të vogla','Çarje të mëdha','Njolla lagështie','Gips/plafonierë','Beton i ekspozuar — rinivelim'], section:'Gjendja' },
    { key:'prep_work',           label:'Punë parapërgatitore?',         type:'chips', required:true, icon:'🔨',
      options:['Jo — vetëm ngjyros','Primer + ngjyrosje','Nivelim fini + primer + ngjyrosje','Nivelim i thellë + armaturim + ngjyrosje'] },
    { key:'paint_type',          label:'Lloji i ngjyrës',               type:'chips', icon:'🪣',
      options:['Akrilik matt','Akrilik satin/semi-gloss','Latex e veshur','Silikonike (jashtë)','Minerale/Kireç','Efekte dekorative'], section:'Produkti' },
    { key:'paint_brand_pref',    label:'Preferencë marka',              type:'chips', icon:'🏷️',
      options:['Farben (vendore)','Jotun','Caparol','Dulux','Sikkens','Pa preferencë'] },
    { key:'color_choice',        label:'Ngjyra e dëshiruar',            type:'chips', icon:'🎨',
      options:['E bardhë e pastër','Ngjyrë neutrale (krem/beige)','Ngjyrë e errët akçente','Dy ngjyra (feature wall)','Dua ndihmë nga profesionisti','Kam paletën e ngjyrës'] },
    { key:'coats',               label:'Numri i shtresave',             type:'chips', icon:'🖌️', options:['1 shtresë','2 shtresa (standard)','3 shtresa','Sipas nevojës'], section:'Aplikimi' },
    { key:'protection',          label:'Mbrojtja e mobiljes/dyshemesë',type:'chips', icon:'🛡️', options:['E bëj vetë','Kërkoj nga profesionisti','Dhoma boshe'] },
    { key:'work_hours',          label:'Oraret e preferuara të punës',  type:'chips', icon:'⏰', options:['Çdo orë','08:00–17:00','Vetëm fundjavë','Graduale (1–2 dhoma/ditë)'] },
  ],

  // ────────────────────────────── DYSHEME ────────────────────────────────────
  dysheme: [
    { key:'material',            label:'Materiali i dyshemesë',         type:'chips', required:true, icon:'🪵',
      options:['Parket masiv','Parket laminat','Parket inxhinjerik (engineered)','Vinyl/SPC click','Pllakë ceramike','Pllakë porcelan (large format)','Mermer natyral','Granit','Tapete wall-to-wall'], section:'Materiali' },
    { key:'area_m2',             label:'Sipërfaqja totale (m²)',        type:'number', required:true, icon:'📐', placeholder:'p.sh. 75' },
    { key:'wood_species',        label:'Lloji i drurit (për parket)',   type:'chips', icon:'🌳',
      options:['Ahu (Oak)','Gështenjë (Walnut)','Ah (Beech)','Kumbull (Cherry)','Bambu','Pa preferencë'], dependsOn:'material' },
    { key:'plank_format',        label:'Formati i dërrases',            type:'chips', icon:'📏',
      options:['Ngushtë (≤80mm)','Standarde (80–130mm)','Wide plank (130–200mm)','XXL plank (200mm+)'], section:'Detaje' },
    { key:'finish',              label:'Sipërfaqja e drurit',           type:'chips', icon:'✨',
      options:['Lak matt','Lak semi-gloss','Vaj natyral','Brushed + Oiled','White oiled','Antique/Distressed'] },
    { key:'color_tone',          label:'Toni i ngjyrës',                type:'chips', icon:'🎨',
      options:['Natural/Mjaltë','E errtë (Espresso/Wenge)','Gri (Grey washed)','E bardhë (White wash)','Ngjyrë e mesme'] },
    { key:'subfloor',            label:'Baza ekzistuese',               type:'chips', required:true, icon:'🏗️',
      options:['Shtresë betoni','Shtresë druri ekzistues','Pllakë e vjetër (hiqet)','Parket i vjetër (hiqet)','Ndërtim i ri — screed i ri'], section:'Situata' },
    { key:'remove_existing',     label:'Heqja e dyshemesë ekzistuese?',type:'chips', required:true, icon:'⛏️', options:['Po, përfshihet në çmim','Jo — dysheme e re mbi të vjetrën','Nuk ka ekzistuese'] },
    { key:'underfloor_heat',     label:'Ngrohje nën dysheme (UFH)?',   type:'chips', required:true, icon:'🌡️', options:['Po — elektrike ekzistuese','Po — ujë/hydro ekzistues','Do të instalohet','Jo'] },
    { key:'stairs',              label:'Shkallë me të njëjtin material?',type:'chips', icon:'🪜', options:['Po — sa shkallë?','Jo'] },
    { key:'stairs_count',        label:'Numri i shkallëve',             type:'number', icon:'🪜', placeholder:'p.sh. 14', dependsOn:'stairs', dependsVal:'Po — sa shkallë?' },
    { key:'skirting',            label:'Bord muri (plinth/skirting)?', type:'chips', icon:'📐', options:['Po, i ri i njëjtë material','Po, i ri i bardhë MDF','Jo — ekzistues rikthehet','Jo'] },
    { key:'installation_method', label:'Metoda e montimit',            type:'chips', icon:'🔩', options:['Floating (klikues)','Ngjitje (glue-down)','Vida/çegërt (nail-down)','Sipas materialit'] },
    { key:'humidity_underfloor', label:'Ka lagështi nga poshtë?',      type:'chips', icon:'💧', options:['Po','Jo','Nuk e di'], section:'Çështje teknike' },
  ],

  // ────────────────────────────── ELEKTRIKE ──────────────────────────────────
  elektrike: [
    { key:'job_scope',           label:'Çfarë do të bëhet?',            type:'chips_multi', required:true, icon:'⚡',
      options:['Instalim i ri i plotë','Zëvendësim tabllo kryesore','Pika të reja (priza/çelësa)','Instalim ndriçimi (recessed/LED)','Kabllo jashtme (kanal)','Instalim industrial/trifazë','Smart home / KNX / automatizim'], section:'Shtrirja' },
    { key:'property_size_m2',    label:'Sipërfaqja e objektit (m²)',    type:'number', required:true, icon:'📐', placeholder:'p.sh. 100' },
    { key:'circuit_type',        label:'Sistemi i rrymës',              type:'chips', required:true, icon:'⚡',
      options:['Monofazë 220V (standard)','Trifazë 380V','Të dyja (komb.)'] },
    { key:'panel_ampere',        label:'Fuqia e taborës (A)',           type:'chips', icon:'🔌',
      options:['25A','32A','40A','63A','100A+','Nuk e di — sipas nevojës'] },
    { key:'new_circuits',        label:'Numri i qarqeve të reja',       type:'number', icon:'🔌', placeholder:'p.sh. 8', hint:'Çdo dhomë = min 2-3 qarqe (drita + priza)', section:'Detaje' },
    { key:'new_sockets',         label:'Priza + çelësa të rinj',        type:'number', icon:'🔌', placeholder:'p.sh. 30' },
    { key:'conduit_type',        label:'Lloji i kanaleve',              type:'chips', icon:'🔩',
      options:['Korrugat nën suvatim','PVC kanal sipërfaqe','Metal kanal','Plafond i rreme (gjipsi)'] },
    { key:'outdoor',             label:'Instalim i jashtëm?',           type:'chips', icon:'🌧️', options:['Po','Jo'], section:'Jashtme' },
    { key:'outdoor_type',        label:'Çfarë jashtë?',                 type:'chips_multi', icon:'🌧️',
      options:['Ndriçim fasade','Priza jashtme IP65','Kamere sigurie','Karikues EV','Gjenerator backup'], dependsOn:'outdoor', dependsVal:'Po' },
    { key:'smart_home',          label:'Automatizim / Smart Home?',     type:'chips', icon:'📱', options:['Po — full KNX','Po — sistem i thjeshtë (Tuya/Shelly)','Jo'], section:'Teknologji' },
    { key:'ev_charger',          label:'Karikues elektrik për veturë?', type:'chips', icon:'🚗', options:['Po — 7.4kW (Type 2)','Po — 11kW (Type 2 3-fazë)','Jo'] },
    { key:'certif',              label:'Certifikatë elektrike zyrtare?',type:'chips', required:true, icon:'📋', options:['Po — e detyrueshme (CEE)','Jo','Nuk e di'] },
    { key:'cable_brand',         label:'Preferencë kablo',              type:'chips', icon:'🏷️', options:['Elka (vendore)','Prysmian','Nexans','Pa preferencë'] },
  ],

  // ────────────────────────────── HIDRAULIKE ─────────────────────────────────
  hidraulike: [
    { key:'job_scope',           label:'Çfarë do të bëhet?',            type:'chips_multi', required:true, icon:'🔧',
      options:['Riparim rrjedhje urgjente','Instalim hidraulike e re','Zëvendësim tubash të vjetër','Bojler i ri','Radiatorë të rinj','Ngrohje dyshemeje (hydro)','Kanalizim i ri','Sistemim presioni'], section:'Shtrirja' },
    { key:'pipe_material',       label:'Materiali i tubave',            type:'chips', required:true, icon:'🔩',
      options:['PPR (polipropileni — standard)','PEX (kryqëzuar — fleksibël)','Bakër','Multistrat (alu+plastik)','Zink (i vjetër — hiqet)','Inoks'] },
    { key:'bathroom_count',      label:'Numri i banjos',                type:'number', required:true, icon:'🚿', placeholder:'p.sh. 2', section:'Objekti' },
    { key:'kitchen_connections', label:'Lidhje kuzhine?',               type:'chips', icon:'🍳', options:['Po','Jo'] },
    { key:'boiler_type',         label:'Lloji i bojlerit',              type:'chips', required:true, icon:'🔥',
      options:['Gaz natyror (kondensimi)','Gaz natyror (standard)','Naftë','Biomasa (pellet)','Elektrik (bojler tank)','Pompë nxehtësie (A2W)','Sistem solar termal','Pa bojler — lidhje ne rrjet'] },
    { key:'boiler_power_kw',     label:'Fuqia e bojlerit (kW)',         type:'chips', icon:'💪',
      options:['Deri 15kW (apartament)','15–24kW (shtëpi mesme)','24–35kW (shtëpi e madhe)','35kW+ (komercial)'] },
    { key:'radiators',           label:'Radiatorë?',                    type:'chips', icon:'♨️', options:['Po','Jo'], section:'Ngrohje' },
    { key:'radiator_count',      label:'Numri i radiatorëve',           type:'number', icon:'♨️', placeholder:'p.sh. 8', dependsOn:'radiators', dependsVal:'Po' },
    { key:'radiator_type',       label:'Lloji i radiatorëve',           type:'chips', icon:'♨️',
      options:['Çelik panel (standard)','Alumin (ngrohje e shpejtë)','Dizajn (dekorativ)','Lloje të ndryshme'], dependsOn:'radiators', dependsVal:'Po' },
    { key:'underfloor_heating',  label:'Ngrohje dyshemeje (hydro UFH)?',type:'chips', icon:'🌡️', options:['Po — instalim i ri','Po — lidhje ekzistuese','Jo'] },
    { key:'water_pressure',      label:'Problem me presionin e ujit?',  type:'chips', icon:'💧', options:['Po — shumë i ulët','Po — shumë i lartë','Jo — normal'], section:'Diagnoza' },
    { key:'leak_location',       label:'Vendndodhja e rrjedhjes',       type:'chips', icon:'📍',
      options:['Tub i dukshëm','Nën dysheme','Brenda murit','WC/sifon','Bojler/boiler','Nuk e di'] },
    { key:'water_hardness',      label:'Ujë i fortë (kireç)?',          type:'chips', icon:'🪨', options:['Po — nevojitet filtër/softener','Jo','Nuk e di'] },
  ],

  // ────────────────────────────── NDERTIM ────────────────────────────────────
  ndertim: [
    { key:'project_type',        label:'Lloji i projektit',             type:'chips', required:true, icon:'🏗️',
      options:['Ndërtim i ri (from scratch)','Shtesë kate ose krah','Rinovim struktural i plotë','Demolim & rindërtim','Riparim themeli','Bunker/bodrum','Objekt industrial/tregtar'], section:'Lloji' },
    { key:'structure',           label:'Sistemi strukturor',            type:'chips', required:true, icon:'🧱',
      options:['Beton i armuar (skelet)','Tulla portante','Çelik (steel frame)','Dru (timber frame)','Bllok siporex/ytong','Prefabrikat beton','Kombinim'] },
    { key:'total_area_m2',       label:'Sipërfaqja e ndërtimit (m²)',   type:'number', required:true, icon:'📐', placeholder:'p.sh. 200', section:'Dimensionet' },
    { key:'floors',              label:'Numri i kateve',                type:'number', required:true, icon:'🏢', placeholder:'p.sh. 2', min:1 },
    { key:'basement',            label:'Ka bodrum/suteren?',            type:'chips', icon:'⬇️', options:['Po','Jo'] },
    { key:'roof_type',           label:'Lloji i çatisë',                type:'chips', icon:'🏠',
      options:['Çati me pjerrësi (druri)','Çati e sheshtë (beton)','Mansardë','Çati çelik','Kombinim'] },
    { key:'permit_status',       label:'Statusi i lejes',               type:'chips', required:true, icon:'📋',
      options:['Leja e plotë — gati','Në proces leje — 1–3 muaj','Nuk ka filluar — nevojit ndihmë','Objekt pa leje (legalizim)'], section:'Ligjore' },
    { key:'architect',           label:'Ka projekt arkitekturor/inxhinjerik?',type:'chips', required:true, icon:'📐',
      options:['Po — projekt i kompletuar','Po — vetëm projekt arkitekturor','Pjesërisht','Jo — nevojitet nga e para'] },
    { key:'terrain',             label:'Lloji i terrenit',              type:'chips', icon:'⛰️',
      options:['Rrafsh — nga rruga','Kodrinor (pjerrësi mesatare)','Shumë kodrinor (>20°)','Shkëmbor','Argjilor/kënetë','I panjohur — nevojit studim gjeoteknik'] },
    { key:'demolition',          label:'Nevojitet demolim?',            type:'chips', icon:'⛏️', options:['Jo','Po — i pjesshëm','Po — i plotë'], section:'Para ndërtimit' },
    { key:'utilities',           label:'Infrastruktura ekzistuese',     type:'chips_multi', icon:'⚡',
      options:['Rrymë në parcelë','Ujë në parcelë','Kanalizim','Gaz','Asnjë — gjithçka sjell'] },
    { key:'timeline',            label:'Koha e synuar e ndërtimit',     type:'chips', icon:'📅',
      options:['3–6 muaj','6–12 muaj','12–18 muaj','Mbi 18 muaj','Nevojit planifikim profesional'], section:'Planifikimi' },
    { key:'supervision',         label:'Mbikëqyrje inxhinjerike gjatë ndërtimit?',type:'chips', icon:'👷', options:['Po — e detyrueshme','Jo','Do ta shqyrtoj'] },
  ],

  // ────────────────────────────── DYER ───────────────────────────────────────
  dyer: [
    { key:'scope',               label:'Çfarë po keni nevojë?',         type:'chips_multi', required:true, icon:'🔍',
      options:['Dyer të brendshme','Dyer të jashtme (hyrje)','Dritare','Porta garazhi','Dyer rrëshqitëse (sliding)','Dyer harmonikë (folding)','Fasadë xham (curtain wall)'], section:'Shtrirja' },
    { key:'door_count',          label:'Numri i dyerve',                type:'number', icon:'🚪', placeholder:'p.sh. 6' },
    { key:'window_count',        label:'Numri i dritareve',             type:'number', icon:'🪟', placeholder:'p.sh. 10' },
    { key:'material',            label:'Materiali kryesor',             type:'chips', required:true, icon:'🏗️',
      options:['PVC (polimer — mirëmbajtje zero)','Alumin me tkurrje termike','Dru natyral masiv','Dru me veshje alumini jashtë','Inoks / çelik'], section:'Materiali' },
    { key:'glass_type',          label:'Lloji i xhamit',                type:'chips', required:true, icon:'🪟',
      options:['Double glazing 4/16/4 (standard)','Double glazing me Argon + Low-E','Triple glazing (passive house)','Xham privaci/mat','Xham i siguruar (laminated)','Xham inteligjent (electrochromic)'] },
    { key:'profile_type',        label:'Klasa e profilit',              type:'chips', icon:'🔬',
      options:['3 dhoma PVC (ekonomik)','5 dhoma PVC (standard)','6+ dhoma PVC (premium)','Alumin standard','Alumin slim/minimal frame'] },
    { key:'color',               label:'Ngjyra e kornizave',            type:'chips', required:true, icon:'🎨',
      options:['E bardhë klasike','Antracit mat (RAL 7016)','E zezë (RAL 9005)','Imitim druri/ahu','Imitim druri/arra','Sipas RAL — spec. ngjyrë'] },
    { key:'security_level',      label:'Klasa e sigurisë (dyer hyrje)',  type:'chips', icon:'🔒',
      options:['RC1 (standard)','RC2 (rezistencë e shtuar)','RC3 (antithyerje)','RC4+ (blinduar)'] },
    { key:'handle_type',         label:'Tipi i bravës/doreze',          type:'chips', icon:'🗝️',
      options:['Standard (çelës)','Multipoint lock (3+ pika)','Bravë elektrike','Fingerprint/kod','Smart lock (Bluetooth/app)'] },
    { key:'shutter_type',        label:'Roleta/grila?',                 type:'chips', icon:'🌅',
      options:['Roleta PVC manuele','Roleta alumin manuele','Roleta motorike','Jaluzje (venetian)','Grila inoks/çelik','Jo — pa roleta'] },
    { key:'installation',        label:'Montim — situata aktuale',      type:'chips', required:true, icon:'🔧',
      options:['Zëvendësim — kornizat ekzistuese hiqen','Zëvendësim — korniza mbi kornizë (renovim)','Instalim i ri — dhomë pa asgjë'], section:'Montimi' },
    { key:'glass_option',        label:'Dritë shtesë (transom/sidelight)?',type:'chips', icon:'💡', options:['Po','Jo'] },
  ],

  // ────────────────────────────── FASADA ─────────────────────────────────────
  fasada: [
    { key:'scope',               label:'Çfarë do të bëhet?',            type:'chips_multi', required:true, icon:'🔍',
      options:['Suvatim i ri i jashtëm','Izolim termal (ETICS/EPS)','Fasadë ventiluar','Ngjyrosje fasade','Rindërtim fasade ekzistues','Reparime lokale (çarje/njolla)'], section:'Shtrirja' },
    { key:'facade_area_m2',      label:'Sipërfaqja e fasadës (m²)',     type:'number', required:true, icon:'📐', placeholder:'p.sh. 350', hint:'Perimetri × lartësia — minus hapjet (dritare/dyer)' },
    { key:'current_cladding',    label:'Veshja aktuale e fasadës',      type:'chips', required:true, icon:'🏚️',
      options:['Suvatim i vjetër — gjendje e mirë','Suvatim i vjetër — dëmtuar/çarë','Xhami (beton i ekspozuar)','Fasadë ventiluar e vjetër','Ndërtim i ri — pa suvatim'], section:'Situata' },
    { key:'insulation',          label:'Izolim termal?',                type:'chips', required:true, icon:'🌡️', options:['Po — e detyrueshme','Jo — vetëm suvatim/ngjyrosje'] },
    { key:'insulation_type',     label:'Lloji i izolimit',              type:'chips', icon:'🌡️',
      options:['EPS (polistiren) — standard','EPS Grafite (performancë e lartë)','Mineral wool (rockwool) — zjarrezist.','Phenolic foam (ultra-thin)','PIR/PUR panels'], dependsOn:'insulation', dependsVal:'Po — e detyrueshme' },
    { key:'insulation_cm',       label:'Trashësia izolimit (cm)',       type:'chips', icon:'📏',
      options:['5 cm','8 cm','10 cm (rekomandohet)','12 cm','15 cm','20 cm (passive)'], dependsOn:'insulation', dependsVal:'Po — e detyrueshme' },
    { key:'finish_type',         label:'Lloji i sipërfaqes finale',     type:'chips', required:true, icon:'✨',
      options:['Suvatim silikonik dekorativ (thin coat)','Suvatim akrilik','Suvatim mineral','Fasadë ventiluar — alumin composite','Fasadë ventiluar — HPL','Fasadë ventiluar — klinker','Guri natyral/artificial','Dru termodruor'] },
    { key:'finish_texture',      label:'Tekstura sipërfaqes',           type:'chips', icon:'🔲',
      options:['Smooth (rrafsh)','Fine aggregate (1mm)','Medium aggregate (1.5–2mm)','Rough (3mm+)','Scratched (Scheibenputz)'] },
    { key:'color_system',        label:'Ngjyra e fasadës',              type:'chips', icon:'🎨',
      options:['E bardhë ose krem','Ngjyrë e çelët (gri, beige)','Ngjyrë e mesme','Ngjyrë e errët (kontrast)','Dy ngjyra (plane të ndryshme)','Do të zgjidhet me arkitektin'] },
    { key:'scaffolding',         label:'Skelë (scaffolding)?',          type:'chips', required:true, icon:'🪜',
      options:['Po — unë siguroj','Po — profesionisti siguron','Jo — vepër nëntoke / veçmas'] },
    { key:'balconies',           label:'Ballkone — trajtim ballkonesh?',type:'chips', icon:'🏢', options:['Po','Jo'] },
    { key:'balcony_count',       label:'Numri i ballkoneve',            type:'number', icon:'🏢', placeholder:'p.sh. 4', dependsOn:'balconies', dependsVal:'Po' },
    { key:'sealant_joints',      label:'Mbushje çarje/fuga ekspansioni?',type:'chips', icon:'🔧', options:['Po','Jo','Nuk e di'], section:'Detaje' },
    { key:'window_reveals',      label:'Trajtim sguafet dritareve?',    type:'chips', icon:'🪟', options:['Po','Jo'] },
  ],

  // ────────────────────────────── NGROHJE ────────────────────────────────────
  ngrohje: [
    { key:'system_type',         label:'Sistemi i kërkuar',             type:'chips', required:true, icon:'🌡️',
      options:['Ngrohje qendrore me radiatorë','Ngrohje dyshemeje ujë (hydronic UFH)','Ngrohje dyshemeje elektrike','Pompë nxehtësie ajër-ujë (A2W heat pump)','Pompë nxehtësie ajër-ajër (VRF/VRV)','Kondicioner me pompë (split)','Multi-split (1 jashtme + disa brendshme)','Kalorifer panel elektrik','Kamin/sobë biomase'], section:'Sistemi' },
    { key:'scope',               label:'Instalim i ri apo zëvendësim?', type:'chips', required:true, icon:'🔧',
      options:['Instalim i ri i plotë (asgjë ekzistuese)','Zëvendësim bojler — tubat mbeten','Zëvendësim i plotë (bojler + radiatorë + tuba)','Shtesë/zgjerim i sistemit ekzistues','Vetëm servisim/riparim'] },
    { key:'property_m2',         label:'Sipërfaqja totale (m²)',        type:'number', required:true, icon:'📐', placeholder:'p.sh. 130' },
    { key:'rooms_count',         label:'Numri i dhomave',               type:'number', required:true, icon:'🏠', placeholder:'p.sh. 5' },
    { key:'building_insulation', label:'Izolimi i ndërtesës',           type:'chips', required:true, icon:'🌡️',
      options:['E re/izoluar mirë (pas 2010)','Mesatare (1990–2010)','E vjetër/e paizoluar (para 1990)','Nuk e di'], section:'Efikasiteti' },
    { key:'boiler_fuel',         label:'Karburanti/burimi i nxehtësisë',type:'chips', required:true, icon:'🔥',
      options:['Gaz natyror (i preferuar)','Gaz propan/butan (butel)','Naftë','Dru/pellet/biomase','Elektrik','Burim gjeotermik','Energji solare termale','Rrjet i ngrohjes qendrore (district heating)'] },
    { key:'boiler_brand',        label:'Preferencë marka bojler',       type:'chips', icon:'🏷️',
      options:['Viessmann (Gjermani)','Vaillant (Gjermani)','Bosch/Buderus','Ariston (Itali)','Ferroli (Itali)','Immergas','Wolf','Pa preferencë'] },
    { key:'radiator_type',       label:'Lloji i radiatorëve',           type:'chips', icon:'♨️',
      options:['Çelik panel Kermi/Purmo','Alumin (ngrohje e shpejtë)','Mburu vertikale (design)','Cevore çelik (retro)','Konvektor nën dysheme'], section:'Emituesit' },
    { key:'controls',            label:'Sistemi i kontrollit',          type:'chips', icon:'📱',
      options:['Termostat standard','Termostat programueshëm','Smart thermostat (Nest/Hive/Tado)','Control room-by-room (zona)','Integrim full smart home'] },
    { key:'dhw',                 label:'Ujë i nxehtë sanitar (DHW)?',   type:'chips', icon:'🚿', options:['Po — i integruar me bojler','Po — bojler i veçantë','Jo — heater elektrik i veçantë'], section:'Sanitare' },
    { key:'solar_combo',         label:'Kombinim me panel solar termal?',type:'chips', icon:'☀️', options:['Po — solar thermal','Po — heat pump solar PVT','Jo'] },
    { key:'energy_cert',         label:'Certifikatë energjetike?',      type:'chips', icon:'📋', options:['Po — e nevojshme','Jo','Nuk e di'] },
  ],

  // ────────────────────────────── OBORR ──────────────────────────────────────
  oborr: [
    { key:'scope',               label:'Çfarë do të bëhet?',            type:'chips_multi', required:true, icon:'🌿',
      options:['Rregullim/nivelim terreni','Rethojë/gardh i ri','Kalldrëm (pllakë/beton/asfalt)','Bar i gjelbër (lëndinë)','Pemë dekorative & shkurre','Sistemim ujitjeje automatike','Ndriçim oborri','Pishina','Pergolë/verandë','Fuçi/mbeturinë estetike'], section:'Shtrirja' },
    { key:'total_area_m2',       label:'Sipërfaqja totale e oborrit (m²)',type:'number', required:true, icon:'📐', placeholder:'p.sh. 300' },
    { key:'pavement_area_m2',    label:'Sipërfaqja kalldrëmit/betonit (m²)',type:'number', icon:'📐', placeholder:'p.sh. 120', section:'Detaje' },
    { key:'pavement_type',       label:'Materiali i kalldrëmit',        type:'chips', icon:'🧱',
      options:['Pllakë betoni vibropresuar','Pllakë graniti natyral','Granit artificial','Asfalt','Zhavorr dekorativ','Beton i lyer','Dru kompozit (deck)','Dru i trajtuar termikisht','Kombinim materialesh'] },
    { key:'fence_type',          label:'Lloji i gardhit',               type:'chips', icon:'🚧',
      options:['Hekur forge (klasik)','Alumin (mirëmbajtje zero)','Inoks','Beton prefabrikat','Gur natyral/artificial','Panel zink/rrjetë','Dru (privat)','Planta/bimë (mur gjelbër)'] },
    { key:'fence_height_m',      label:'Lartësia e gardhit (m)',        type:'chips', icon:'📏',
      options:['0.5–1m (estetik)','1–1.5m (standard)','1.5–2m (privatësi)','2m+ (siguri)'] },
    { key:'fence_linear_m',      label:'Gjatësia e gardhit (m)',        type:'number', icon:'📏', placeholder:'p.sh. 60' },
    { key:'gate',                label:'Portë hyrëse?',                 type:'chips', icon:'🚗',
      options:['Portë rrëshqitëse motorike','Portë me dy krah motorike','Portë manuale','Pa portë'], section:'Hyrja' },
    { key:'gate_automation',     label:'Automatizim porte',             type:'chips', icon:'📱',
      options:['Telekomandë','App smartphone','Sensor loop detektim veture','Sistem intercom/video'], dependsOn:'gate' },
    { key:'lawn',                label:'Lëndinë (bar)?',                type:'chips', icon:'🌱', options:['Po — mbjellje (seeding)','Po — tapete bar (sod)','Jo'], section:'Gjelbërim' },
    { key:'trees_shrubs',        label:'Pemë dhe shkurre?',             type:'chips', icon:'🌳', options:['Po — sipas planit','Po — dua sugjerime nga profesionisti','Jo'] },
    { key:'irrigation',          label:'Ujitje automatike?',            type:'chips', icon:'💧', options:['Po — sistemim i plotë','Po — vetëm kori kryesore','Jo'] },
    { key:'outdoor_lighting',    label:'Ndriçim oborri?',               type:'chips_multi', icon:'💡',
      options:['Ndriçim rruge/shtegjesh','Ndriçim pemësh (uplighting)','Ndriçim bollard','Spot muri','Ndriçim pishinës','Jo nevojitet'] },
    { key:'pool',                label:'Pishinë?',                      type:'chips', icon:'🏊', options:['Po — ndërtim pishina','Po — renovim pishina ekzistuese','Jo'] },
    { key:'pool_type',           label:'Tipi i pishinës',               type:'chips', icon:'🏊',
      options:['Beton me mozaik','Fibra qelqi (FRP)','Inoks','Liner PVC','Pishina e ngritur (above ground)'], dependsOn:'pool', dependsVal:'Po — ndërtim pishina' },
  ],

  // ────────────────────────────── TJETER ─────────────────────────────────────
  tjeter: [
    { key:'service_category',    label:'Lloji i shërbimit',             type:'chips', required:true, icon:'🔨',
      options:['Riparime të vogla të ndryshme','Montim mobiljesh/pajisjesh','Servis aparaturash','Transport & zhvendosje','Pastrim profesional','Punë sezonale','Gipserie & dekorative','Mermeri & guri (punime speciale)','Skulpturë druri / gdhendja','Tjetër (specifiko)'], section:'Kategoria' },
    { key:'description_free',    label:'Përshkruani nevojën tuaj',      type:'textarea', required:true, icon:'📝', placeholder:'Tregoni sa më shumë detaje për punën që ju nevojitet. Ku ndodhet, çfarë duhet bërë, nëse keni materiale, etj.' },
    { key:'specialist_type',     label:'Çfarë lloj profesionisti?',     type:'chips', icon:'👷',
      options:['Murator i përgjithshëm','Elektricist','Hidraulik','Marangoz','Skarifikim/Lyerje','Profesionist i specializuar','Ekip i plotë'] },
    { key:'urgency_level',       label:'Urgjenca',                      type:'chips', required:true, icon:'⏰',
      options:['Shumë urgjent — brenda 24 orësh','Urgjent — brenda javës','Normal — brenda muajit','Jo urgjent — sipas disponibilitetit'] },
    { key:'duration',            label:'Kohëzgjatja e vlerësuar',       type:'chips', icon:'⏱️',
      options:['1–2 orë','Gjysëm dite','1 ditë','2–3 ditë','1 javë','Mbi 1 javë'] },
    { key:'materials',           label:'Materialet',                    type:'chips', required:true, icon:'📦',
      options:['I siguroj vetë gjithçka','Profesionisti siguron materialin','Bashkëpunim — secili pjesën e vet','Nuk nevojiten materiale'] },
    { key:'access',              label:'Qasja në objekt',               type:'chips', icon:'🔑',
      options:['Çdo kohë — çelës disponibël','Vetëm ditët e punës','Vetëm fundjavë','Kam nevojë të jem prezent gjithmonë'] },
    { key:'repeat',              label:'Pune përsëritëse?',             type:'chips', icon:'🔄',
      options:['Jo — vetëm kjo herë','Po — çdo javë','Po — çdo muaj','Po — sipas nevojës (on-call)'] },
  ],
}

// ─── SMART TITLE SUGGESTIONS ──────────────────────────────────────────────────
const TITLE_SUGGESTIONS: Partial<Record<CatId, string[]>> = {
  banjo:      ['Rinovim i plotë banjoje 6m²','Rinovim banjo me vaskë dhe dush','Zëvendësim komplet sanitarësh','Kafelizhim dhe hidraulikë banjoje'],
  kuzhine:    ['Kuzhine e re moderne me island','Zëvendësim kabinete dhe countertop','Kuzhine kompakte e integruar','Rinovim i plotë kuzhine'],
  ngjyrosje:  ['Ngjyrosje e plotë e banesës 90m²','Ngjyrosje + nivelim mureve — 3 dhoma','Suvatim dhe ngjyrosje fasade','Ngjyrosje brendshme me efekte'],
  dysheme:    ['Parket masiv ahu — 60m²','Pllakë porcelan large format','Parket laminat me ngrohje dyshemeje','Vinyl SPC click — apartament'],
  elektrike:  ['Instalim elektrik i plotë — 90m²','Zëvendësim tabllo + pika elektrike','Smart home KNX — shtëpi 150m²','Shtesë pikat elektrike 3 dhoma'],
  hidraulike: ['Instalim hidraulike e re + bojler gaz','Zëvendësim tubash PPR — apartament','Ngrohje dyshemeje hydronik','Riparim rrjedhje urgente'],
  ndertim:    ['Ndërtim shtëpie private 2 kate 180m²','Shtesë kati 80m²','Themelje dhe skelet RC','Rinovim struktural i plotë'],
  dyer:       ['PVC dritare double-glaze — 10 copë','Dyer alumin fasadë + portë hyrëse','Zëvendësim 8 dritare + 5 dyer','Derë hyrje RC2 + roleta motorike'],
  fasada:     ['Izolim termal EPS 10cm + suvatim silikonik','Fasadë ventiluar alumin composite','Risuvatim + ngjyrosje fasade 400m²','Restaurim fasade guri natyral'],
  ngrohje:    ['Instalim ngrohje qendrore + bojler gaz Viessmann','Zëvendësim sistem ngrohje — apartament','Pompë nxehtësie A2W + UFH','Multi-split 4 kondicioner'],
  oborr:      ['Rregullim i plotë oborri 250m² + gardh','Kalldrëm graniti + pemë dekorative','Pishinë beton + peizazh','Gardh alumin motorik + kalldrëm'],
  tjeter:     ['Riparime të ndryshme shtëpie','Montim mobiljesh + punë të vogla','Pastrim profesional + riparime'],
}

// ─── FIELD RENDERER ───────────────────────────────────────────────────────────
function FieldInput({
  field, value, onChange, accent
}: {
  field: Field; value: any; onChange: (v: any) => void; accent: string
}) {
  const [focused, setFocused] = useState(false)

  const baseInput: React.CSSProperties = {
    width:'100%', padding:'11px 14px', fontSize:14, fontFamily:'inherit',
    background: focused ? `${accent}08` : 'rgba(240,236,228,0.03)',
    border: `1px solid ${focused ? `${accent}50` : 'rgba(240,236,228,0.09)'}`,
    borderRadius:10, color:'#f0ece4', outline:'none',
    transition:'all 0.2s', boxSizing:'border-box' as const,
  }

  if (field.type === 'chips' || field.type === 'chips_multi') {
    const isMulti = field.type === 'chips_multi'
    const selectedVals: string[] = isMulti ? (Array.isArray(value) ? value : []) : []
    return (
      <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
        {(field.options||[]).map(opt => {
          const isSelected = isMulti ? selectedVals.includes(opt) : value === opt
          return (
            <button key={opt} type="button"
              onClick={() => {
                if (isMulti) onChange(isSelected ? selectedVals.filter(v=>v!==opt) : [...selectedVals, opt])
                else         onChange(isSelected ? '' : opt)
              }}
              style={{
                padding:'8px 14px', borderRadius:20, fontSize:13, fontFamily:'inherit',
                border:`1.5px solid ${isSelected ? accent : 'rgba(240,236,228,0.1)'}`,
                background: isSelected ? `${accent}18` : 'rgba(240,236,228,0.02)',
                color: isSelected ? '#f0ece4' : 'rgba(240,236,228,0.5)',
                fontWeight: isSelected ? 700 : 500, cursor:'pointer',
                transition:'all 0.15s', outline:'none',
                boxShadow: isSelected ? `0 0 0 1px ${accent}40` : 'none',
              }}>
              {isSelected && <span style={{ marginRight:4, fontSize:10 }}>✓</span>}
              {opt}
            </button>
          )
        })}
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <textarea value={value||''} rows={4}
        onChange={e => onChange(e.target.value)}
        placeholder={field.placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...baseInput, resize:'vertical', minHeight:100 }}/>
    )
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : 'text'}
      value={value || ''}
      min={field.min ?? (field.type==='number' ? 0 : undefined)}
      max={field.max}
      onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={baseInput}
    />
  )
}

// ─── STEP BAR ─────────────────────────────────────────────────────────────────
function StepBar({ step, total, labels, accent }: { step:number; total:number; labels:string[]; accent:string }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', marginBottom:36 }}>
      {labels.map((label, i) => {
        const done   = i < step
        const active = i === step
        return (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', flex: i < total - 1 ? 1 : 0 }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
              <div style={{
                width:32, height:32, borderRadius:'50%', flexShrink:0,
                background: done ? accent : active ? `${accent}20` : 'rgba(240,236,228,0.05)',
                border: `2px solid ${done ? accent : active ? `${accent}70` : 'rgba(240,236,228,0.1)'}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:800,
                color: done ? '#fff' : active ? accent : 'rgba(240,236,228,0.3)',
                transition:'all 0.3s',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{ fontSize:9, fontWeight:700, color:active?accent:done?'rgba(240,236,228,0.45)':'rgba(240,236,228,0.2)', textTransform:'uppercase', letterSpacing:'0.07em', whiteSpace:'nowrap' }}>{label}</span>
            </div>
            {i < total - 1 && (
              <div style={{ flex:1, height:2, background: done ? accent : 'rgba(240,236,228,0.08)', margin:'15px 5px 0', transition:'background 0.4s ease' }}/>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function NewApplicationPage({ profile }: { profile: Profile }) {
  const router   = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const topRef = useRef<HTMLDivElement>(null)

  const STEP_LABELS = ['Kategoria', 'Projekti', 'Detajet', 'Buxheti', 'Konfirmo']
  const TOTAL_STEPS = 5

  // ─── State
  const [step,         setStep]         = useState(0)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')

  // Core
  const [categoryId,   setCategoryId]   = useState<CatId|''>('')
  const [title,        setTitle]        = useState('')
  const [description,  setDescription]  = useState('')
  const [city,         setCity]         = useState(profile.city || '')
  const [areaSqm,      setAreaSqm]      = useState('')
  const [numRooms,     setNumRooms]     = useState('')
  const [propertyType, setPropertyType] = useState('')

  // Budget + conditions
  const [budgetMin,    setBudgetMin]     = useState('')
  const [budgetMax,    setBudgetMax]     = useState('')
  const [providerType, setProviderType] = useState<'both'|'company'|'worker'>('both')
  const [urgency,      setUrgency]      = useState<'urgent'|'normal'|'flexible'>('normal')
  const [timelineWeeks,setTimeline]     = useState('')
  const [hasMaterials, setHasMaterials] = useState<boolean|null>(null)

  // Category-specific dynamic fields
  const [catFields, setCatFields] = useState<Record<string, any>>({})

  const cat    = CATEGORIES.find(c => c.id === categoryId)
  const accent = cat?.color || '#e8621a'
  const fields = categoryId ? (CAT_FIELDS[categoryId as CatId] || []) : []

  const suggestions = categoryId ? (TITLE_SUGGESTIONS[categoryId as CatId] || []) : []
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Reset cat fields when category changes
  useEffect(() => { setCatFields({}) }, [categoryId])

  function scrollTop() {
    setTimeout(() => topRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 50)
  }
  function setField(key: string, val: any) {
    setCatFields(prev => ({ ...prev, [key]: val }))
  }

  // ─── Validation per step
  function validate(): string {
    if (step === 0) {
      if (!categoryId) return 'Ju lutem zgjidhni kategorinë e projektit.'
    }
    if (step === 1) {
      if (!title.trim())              return 'Titulli i projektit është i detyrueshëm.'
      if (title.trim().length < 10)   return 'Titulli duhet të jetë të paktën 10 karaktere.'
      if (title.trim().length > 80)   return 'Titulli nuk mund të ketë mbi 80 karaktere.'
      if (!city)                      return 'Zgjidhni qytetin ku ndodhet projekti.'
      if (!description.trim())        return 'Përshkrimi i projektit është i detyrueshëm.'
      if (description.trim().length < 30) return 'Ju lutem shkruani të paktën 30 karaktere në përshkrim.'
    }
    if (step === 2) {
      const reqFields = fields.filter(f => {
        if (!f.required) return false
        if (f.dependsOn) {
          const depVal = catFields[f.dependsOn]
          if (f.dependsVal && depVal !== f.dependsVal) return false
          if (!f.dependsVal && !depVal) return false
        }
        return true
      })
      for (const f of reqFields) {
        const v = catFields[f.key]
        if (v === undefined || v === '' || v === null || (Array.isArray(v) && v.length === 0)) {
          return `"${f.label}" — kjo fushë është e detyrueshme.`
        }
      }
    }
    if (step === 3) {
      if (budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax)) {
        return 'Buxheti minimal nuk mund të jetë më i madh se maksimali.'
      }
    }
    return ''
  }

  function handleNext() {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
    scrollTop()
  }

  async function handleSubmit() {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true); setError('')
    try {
      // Get category id — use maybeSingle so it doesn't throw if not found
      const { data: catRow } = await supabase
        .from('categories').select('id').eq('slug', categoryId).maybeSingle()

      // Pack all metadata into extra_fields (existing column in DB)
      // If you have run the category_fields_schema.sql migration, the new
      // columns are also available — but we keep extra_fields as the source
      // of truth since it works without the migration.
      const extraData = {
        category_fields: catFields,
        urgency,
        timeline:       timelineWeeks || null,
        has_materials:  hasMaterials ?? false,
        property_type:  propertyType || null,
        num_rooms:      numRooms ? Number(numRooms) : null,
      }

      const { error: dbErr } = await supabase.from('applications').insert({
        client_id:     profile.id,
        category_id:   catRow?.id || null,
        title:         title.trim(),
        description:   description.trim(),
        city,
        area_sqm:      areaSqm   ? Number(areaSqm)  : null,
        budget_min:    budgetMin ? Number(budgetMin) : null,
        budget_max:    budgetMax ? Number(budgetMax) : null,
        provider_type: providerType,
        extra_fields:  extraData,
        expires_at:    new Date(Date.now() + 24 * 3_600_000).toISOString(),
      })
      if (dbErr) { setError(dbErr.message); return }
      router.push('/client/dashboard?success=1')
      router.refresh()
    } catch(e:any) {
      setError(e.message || 'Gabim i papritur. Provo sërish.')
    } finally { setLoading(false) }
  }

  // ─── Derived for step-2 progress
  const visibleFields = fields.filter(f => {
    if (!f.dependsOn) return true
    const depVal = catFields[f.dependsOn]
    return f.dependsVal ? depVal === f.dependsVal : !!depVal
  })
  const filledReq = visibleFields.filter(f => {
    if (!f.required) return false
    const v = catFields[f.key]
    return v !== undefined && v !== '' && v !== null && !(Array.isArray(v) && v.length===0)
  }).length
  const totalReq = visibleFields.filter(f => f.required).length

  // Group fields by section
  function groupBySection(fieldList: Field[]): { section:string|null; fields:Field[] }[] {
    const groups: { section:string|null; fields:Field[] }[] = []
    let current: { section:string|null; fields:Field[] } = { section:null, fields:[] }
    for (const f of fieldList) {
      if (f.section && f.section !== current.section) {
        if (current.fields.length > 0) groups.push(current)
        current = { section:f.section, fields:[f] }
      } else {
        current.fields.push(f)
      }
    }
    if (current.fields.length > 0) groups.push(current)
    return groups
  }

  const groupedFields = groupBySection(visibleFields)

  const labelSt: React.CSSProperties = {
    display:'block', fontSize:11, fontWeight:700,
    color:'rgba(240,236,228,0.45)', textTransform:'uppercase',
    letterSpacing:'0.08em', marginBottom:9,
  }
  const inpStyle = (foc: boolean): React.CSSProperties => ({
    width:'100%', padding:'11px 14px', fontSize:14, fontFamily:'inherit',
    background: foc ? `${accent}08` : 'rgba(240,236,228,0.03)',
    border:`1px solid ${foc ? `${accent}50` : 'rgba(240,236,228,0.09)'}`,
    borderRadius:10, color:'#f0ece4', outline:'none',
    transition:'all 0.2s', boxSizing:'border-box' as const,
  })
  const [foc, setFoc] = useState<Record<string,boolean>>({})
  const F = (k:string) => ({ onFocus:()=>setFoc(p=>({...p,[k]:true})), onBlur:()=>setFoc(p=>({...p,[k]:false})) })

  return (
    <PageShell role="client" userName={profile.full_name} userId={profile.id}
      package={profile.package_type} pageTitle="Aplikim i Ri" pageIcon="📋"
      actions={
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(240,236,228,0.35)' }}>
          {cat && <span style={{ padding:'3px 10px', borderRadius:20, background:`${accent}15`, border:`1px solid ${accent}30`, color:accent, fontWeight:700 }}>{cat.icon} {cat.name}</span>}
          <span>Hapi {step+1}/{TOTAL_STEPS}</span>
        </div>
      }>

      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(18px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .chip-opt:hover    { border-color:rgba(240,236,228,0.25)!important; background:rgba(240,236,228,0.05)!important }
        .cat-card:hover    { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.2)!important }
        select option      { background:#0d1117; color:#f0ece4 }
        .suggestion-btn:hover { background:rgba(240,236,228,0.08)!important; color:#f0ece4!important }
      `}</style>

      <div ref={topRef} style={{ maxWidth:760, margin:'0 auto', animation:'fadeUp 0.4s ease', paddingBottom:60 }}>

        {/* Breadcrumb back */}
        <button onClick={() => step>0 ? (setError(''), setStep(s=>s-1), scrollTop()) : router.back()}
          style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'rgba(240,236,228,0.4)', cursor:'pointer', fontFamily:'inherit', fontSize:13, marginBottom:24, padding:0, transition:'color 0.2s' }}
          onMouseEnter={e=>(e.currentTarget.style.color='rgba(240,236,228,0.7)')}
          onMouseLeave={e=>(e.currentTarget.style.color='rgba(240,236,228,0.4)')}>
          ← {step > 0 ? 'Hapi i mëparshëm' : 'Kthehu'}
        </button>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(1.6rem,3vw,2.2rem)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:6 }}>
            {step === 0 ? <>Çfarë projekt keni?</> :
             step === 1 ? <>Tregoni për <span style={{ color:accent, fontStyle:'italic' }}>projektin</span></> :
             step === 2 ? <>{cat?.icon} Detajet specifike</> :
             step === 3 ? <>Buxheti & <span style={{ color:'#22d3a5', fontStyle:'italic' }}>urgjenca</span></> :
                          <>Konfirmo <span style={{ color:'#a78bfa', fontStyle:'italic' }}>aplikimin</span></>}
          </h1>
          <p style={{ fontSize:13, color:'rgba(240,236,228,0.4)' }}>
            {step === 0 && 'Secila kategori ka formular specifik me pyetjet e duhura'}
            {step === 1 && 'Titull i qartë + përshkrim i mirë = oferta shumë më të sakta'}
            {step === 2 && 'Këto detaje ndihmojnë profesionistët të ofertojnë saktë dhe shpejtë'}
            {step === 3 && 'Buxheti ju ndihmon të merrni oferta realiste'}
            {step === 4 && 'Shqyrtoni gjithçka para postimit'}
          </p>
        </div>

        {/* Step bar */}
        <StepBar step={step} total={TOTAL_STEPS} labels={STEP_LABELS} accent={accent}/>

        {/* Error */}
        {error && (
          <div style={{ marginBottom:20, padding:'11px 16px', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:11, fontSize:13, color:'#fca5a5', display:'flex', alignItems:'center', gap:8 }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ══ STEP 0: Category grid ══════════════════════════════════════════ */}
        {step === 0 && (
          <div style={{ animation:'slideIn 0.3s ease' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
              {CATEGORIES.map(c => (
                <button key={c.id} type="button" className="cat-card"
                  onClick={() => { setCategoryId(c.id); setError('') }}
                  style={{
                    padding:'20px 16px', borderRadius:18, textAlign:'left',
                    border:`1.5px solid ${categoryId===c.id ? c.color : 'rgba(240,236,228,0.08)'}`,
                    background: categoryId===c.id ? c.bg : 'rgba(240,236,228,0.02)',
                    cursor:'pointer', fontFamily:'inherit', outline:'none',
                    transition:'all 0.2s', position:'relative',
                    boxShadow: categoryId===c.id ? `0 4px 20px ${c.color}20` : 'none',
                  }}>
                  {categoryId===c.id && (
                    <div style={{ position:'absolute', top:10, right:10, width:22, height:22, background:c.color, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', fontWeight:900 }}>✓</div>
                  )}
                  <div style={{ fontSize:32, marginBottom:10 }}>{c.icon}</div>
                  <div style={{ fontSize:14, fontWeight:700, color: categoryId===c.id ? '#f0ece4' : 'rgba(240,236,228,0.7)', marginBottom:5, lineHeight:1.3 }}>{c.name}</div>
                  <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)', lineHeight:1.5 }}>{c.desc}</div>
                  {CAT_FIELDS[c.id] && (
                    <div style={{ marginTop:10, fontSize:10, fontWeight:700, color: categoryId===c.id ? c.color : 'rgba(240,236,228,0.2)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                      {CAT_FIELDS[c.id].length} pyetje specifike
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ STEP 1: Title, city, description ═════════════════════════════ */}
        {step === 1 && cat && (
          <div style={{ animation:'slideIn 0.3s ease', display:'flex', flexDirection:'column', gap:22 }}>

            {/* Category badge */}
            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', background:cat.bg, border:`1px solid ${accent}30`, borderRadius:14 }}>
              <span style={{ fontSize:26 }}>{cat.icon}</span>
              <div>
                <div style={{ fontWeight:800, fontSize:15, color:'#f0ece4' }}>{cat.name}</div>
                <div style={{ fontSize:12, color:'rgba(240,236,228,0.45)' }}>{cat.desc}</div>
              </div>
            </div>

            {/* Title with suggestions */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:9 }}>
                <label style={labelSt}>Titulli i projektit *</label>
                {suggestions.length > 0 && (
                  <button type="button" onClick={() => setShowSuggestions(p=>!p)}
                    style={{ fontSize:11, color:accent, background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>
                    💡 Shembuj →
                  </button>
                )}
              </div>
              {showSuggestions && (
                <div style={{ marginBottom:10, padding:'10px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:12, display:'flex', flexDirection:'column', gap:4 }}>
                  {suggestions.map(s => (
                    <button key={s} type="button" className="suggestion-btn"
                      onClick={() => { setTitle(s); setShowSuggestions(false) }}
                      style={{ padding:'8px 12px', background:'transparent', border:'none', color:'rgba(240,236,228,0.55)', cursor:'pointer', fontFamily:'inherit', fontSize:13, textAlign:'left', borderRadius:8, transition:'all 0.15s' }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <input value={title} onChange={e=>setTitle(e.target.value)} maxLength={80}
                placeholder={suggestions[0] || 'Përshkruani shkurt projektin tuaj...'}
                style={inpStyle(foc.title)} {...F('title')}/>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span style={{ fontSize:11, color: title.length<10?'rgba(240,236,228,0.3)':'#22d3a5' }}>
                  {title.length<10 ? `Shto ${10-title.length} karaktere` : '✓ Mirë'}
                </span>
                <span style={{ fontSize:11, color:'rgba(240,236,228,0.3)' }}>{title.length}/80</span>
              </div>
            </div>

            {/* City + Property type */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={labelSt}>Qyteti *</label>
                <select value={city} onChange={e=>setCity(e.target.value)}
                  style={{...inpStyle(foc.city), cursor:'pointer', appearance:'none' as any}} {...F('city')}>
                  <option value="">Zgjedh qytetin...</option>
                  {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSt}>Lloji i pronës</label>
                <select value={propertyType} onChange={e=>setPropertyType(e.target.value)}
                  style={{...inpStyle(foc.prop), cursor:'pointer', appearance:'none' as any}} {...F('prop')}>
                  <option value="">Zgjedh...</option>
                  {['Apartament','Shtëpi private','Vilë','Zyrë','Lokal biznesi','Ndërtesë','Objekt tjetër'].map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Area + Rooms */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label style={labelSt}>Sipërfaqja (m²)</label>
                <input type="number" value={areaSqm} onChange={e=>setAreaSqm(e.target.value)}
                  placeholder="p.sh. 85" min="1"
                  style={inpStyle(foc.area)} {...F('area')}/>
              </div>
              <div>
                <label style={labelSt}>Numri i dhomave</label>
                <input type="number" value={numRooms} onChange={e=>setNumRooms(e.target.value)}
                  placeholder="p.sh. 3" min="1"
                  style={inpStyle(foc.rooms)} {...F('rooms')}/>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelSt}>Përshkrim i detajuar *</label>
              <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={5}
                placeholder="Tregoni gjendjen aktuale, çfarë dëshironi të ndryshojë, nëse keni foto referimi, nëse ka akses të vështirë, etj. Sa më shumë detaje, aq oferta më të sakta do të merrni."
                style={{...inpStyle(foc.desc), resize:'vertical', minHeight:120}} {...F('desc')}/>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span style={{ fontSize:11, color:description.length<30?'rgba(240,236,228,0.3)':description.length<80?'#fbbf24':'#22d3a5' }}>
                  {description.length<30?`Shto ${30-description.length} karaktere`:description.length<80?'👍 Mirë, por shto detaje shtesë':'✓ Përshkrim i mirëfilltë'}
                </span>
                <span style={{ fontSize:11, color:'rgba(240,236,228,0.3)' }}>{description.length}/600</span>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 2: Category-specific fields ═════════════════════════════ */}
        {step === 2 && cat && (
          <div style={{ animation:'slideIn 0.3s ease' }}>

            {/* Progress bar for required fields */}
            <div style={{ marginBottom:24, padding:'12px 16px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:12, display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1, height:5, background:'rgba(240,236,228,0.08)', borderRadius:10, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${totalReq>0?(filledReq/totalReq)*100:0}%`, background:`linear-gradient(90deg,${accent},${accent}cc)`, borderRadius:10, transition:'width 0.4s ease' }}/>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.4)', flexShrink:0 }}>
                {filledReq}/{totalReq} të detyrueshme
              </span>
            </div>

            {groupedFields.map((group, gi) => (
              <div key={gi} style={{ marginBottom:32 }}>
                {/* Section header */}
                {group.section && (
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                    <div style={{ height:1, flex:0, width:20, background:`${accent}60` }}/>
                    <span style={{ fontSize:11, fontWeight:800, color:accent, textTransform:'uppercase', letterSpacing:'0.12em', whiteSpace:'nowrap' }}>{group.section}</span>
                    <div style={{ height:1, flex:1, background:'rgba(240,236,228,0.07)' }}/>
                  </div>
                )}

                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                  {group.fields.map(field => (
                    <div key={field.key}>
                      <label style={{ display:'flex', alignItems:'center', gap:7, fontSize:11, fontWeight:700, color:'rgba(240,236,228,0.5)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>
                        {field.icon && <span style={{ fontSize:14 }}>{field.icon}</span>}
                        {field.label}
                        {field.required && <span style={{ color:accent, marginLeft:1 }}>*</span>}
                      </label>
                      <FieldInput field={field} value={catFields[field.key]} onChange={v=>setField(field.key,v)} accent={accent}/>
                      {field.hint && <div style={{ fontSize:11, color:'rgba(240,236,228,0.3)', marginTop:5 }}>ℹ️ {field.hint}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ STEP 3: Budget + urgency ═════════════════════════════════════ */}
        {step === 3 && (
          <div style={{ animation:'slideIn 0.3s ease', display:'flex', flexDirection:'column', gap:24 }}>

            {/* Budget */}
            <div style={{ padding:'22px', background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.08)', borderRadius:18 }}>
              <div style={{ fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>💰 Buxheti (opsional, por shumë i dobishëm)</div>
              <p style={{ fontSize:12, color:'rgba(240,236,228,0.4)', lineHeight:1.65, marginBottom:18 }}>Kompanitë nuk do t'ju dërgojnë oferta jashtë intervalit tuaj. Kjo ndihmon të filtroni automatikisht.</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelSt}>Nga (€) minimum</label>
                  <input type="number" value={budgetMin} onChange={e=>setBudgetMin(e.target.value)}
                    placeholder="p.sh. 500" min="0" style={inpStyle(foc.bmin)} {...F('bmin')}/>
                </div>
                <div>
                  <label style={labelSt}>Deri (€) maksimum</label>
                  <input type="number" value={budgetMax} onChange={e=>setBudgetMax(e.target.value)}
                    placeholder="p.sh. 3000" min="0" style={inpStyle(foc.bmax)} {...F('bmax')}/>
                </div>
              </div>
              {budgetMin && budgetMax && (
                <div style={{ marginTop:12, padding:'10px 14px', background:`${accent}08`, borderRadius:10, fontSize:12, color:'rgba(240,236,228,0.6)', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ color:accent, fontWeight:700 }}>Buxheti juaj:</span> €{Number(budgetMin).toLocaleString()} – €{Number(budgetMax).toLocaleString()}
                  <span style={{ color:'rgba(240,236,228,0.4)' }}>· Diferenca: €{(Number(budgetMax)-Number(budgetMin)).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Urgency */}
            <div>
              <label style={labelSt}>⏰ Urgjenca e projektit *</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {([
                  { val:'urgent',   icon:'🔴', label:'Urgjent',   sub:'Brenda 1–2 javëve', border:'#ef4444' },
                  { val:'normal',   icon:'🟡', label:'Normal',    sub:'Brenda 1–2 muajve', border:'#fbbf24' },
                  { val:'flexible', icon:'🟢', label:'Fleksibël', sub:'Pa ngutje specifike', border:'#22c55e' },
                ] as const).map(o => (
                  <button key={o.val} type="button" onClick={() => setUrgency(o.val)}
                    style={{ padding:'16px 12px', borderRadius:14, textAlign:'center', border:`1.5px solid ${urgency===o.val?o.border:'rgba(240,236,228,0.08)'}`, background:urgency===o.val?`${o.border}10`:'rgba(240,236,228,0.02)', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}>
                    <div style={{ fontSize:24, marginBottom:7 }}>{o.icon}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:urgency===o.val?'#f0ece4':'rgba(240,236,228,0.6)', marginBottom:3 }}>{o.label}</div>
                    <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>{o.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <label style={labelSt}>📅 Koha e synuar e përfundimit</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {['1 javë','2 javë','1 muaj','2 muaj','3 muaj','6 muaj','Mbi 6 muaj'].map(t => (
                  <button key={t} type="button" onClick={() => setTimeline(timelineWeeks===t?'':t)}
                    style={{ padding:'9px 16px', borderRadius:20, border:`1.5px solid ${timelineWeeks===t?accent:'rgba(240,236,228,0.09)'}`, background:timelineWeeks===t?`${accent}18`:'rgba(240,236,228,0.02)', color:timelineWeeks===t?'#f0ece4':'rgba(240,236,228,0.5)', fontFamily:'inherit', fontSize:13, fontWeight:timelineWeeks===t?700:500, cursor:'pointer', transition:'all 0.15s' }}>
                    {timelineWeeks===t&&<span style={{ marginRight:4, fontSize:10 }}>✓</span>}{t}
                  </button>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div>
              <label style={labelSt}>📦 Materialet — kush i siguron?</label>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {([
                  { val:true,  label:'Unë i siguroj materialet',      desc:'Ju blini dhe sjellni materialet, profesionisti vetëm punon' },
                  { val:false, label:'Profesionisti i siguron gjithçka',desc:'Çmimi i ofertës përfshin edhe materialet' },
                ] as const).map(o => (
                  <button key={String(o.val)} type="button" onClick={() => setHasMaterials(o.val)}
                    style={{ padding:'14px 16px', borderRadius:12, border:`1.5px solid ${hasMaterials===o.val?accent:'rgba(240,236,228,0.09)'}`, background:hasMaterials===o.val?`${accent}12`:'rgba(240,236,228,0.02)', fontFamily:'inherit', cursor:'pointer', transition:'all 0.18s', textAlign:'left' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:hasMaterials===o.val?'#f0ece4':'rgba(240,236,228,0.6)', marginBottom:3 }}>{hasMaterials===o.val&&'✓ '}{o.label}</div>
                    <div style={{ fontSize:11, color:'rgba(240,236,228,0.35)' }}>{o.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Provider */}
            <div>
              <label style={labelSt}>🤝 Kush mund të ofertojë?</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {([
                  { val:'both',    icon:'🤝', label:'Të dyja',  desc:'Kompani & punëtorë' },
                  { val:'company', icon:'🏢', label:'Kompani',  desc:'Vetëm kompani' },
                  { val:'worker',  icon:'👷', label:'Punëtorë', desc:'Individë/artizanë' },
                ] as const).map(o => (
                  <button key={o.val} type="button" onClick={() => setProviderType(o.val)}
                    style={{ padding:'14px 10px', borderRadius:13, textAlign:'center', border:`1.5px solid ${providerType===o.val?accent:'rgba(240,236,228,0.08)'}`, background:providerType===o.val?`${accent}12`:'rgba(240,236,228,0.02)', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{o.icon}</div>
                    <div style={{ fontSize:12, fontWeight:700, color:providerType===o.val?'#f0ece4':'rgba(240,236,228,0.55)', marginBottom:2 }}>{o.label}</div>
                    <div style={{ fontSize:11, color:'rgba(240,236,228,0.3)' }}>{o.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 4: Review & Confirm ════════════════════════════════════ */}
        {step === 4 && cat && (
          <div style={{ animation:'slideIn 0.3s ease', display:'flex', flexDirection:'column', gap:16 }}>

            {/* Hero card */}
            <div style={{ padding:'22px', background:`${accent}0a`, border:`1px solid ${accent}25`, borderRadius:18 }}>
              <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:14 }}>
                <span style={{ fontSize:36, flexShrink:0 }}>{cat.icon}</span>
                <div>
                  <div style={{ fontFamily:"'Fraunces',serif", fontWeight:900, fontSize:'1.15rem', lineHeight:1.3, marginBottom:4 }}>{title}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {[city, propertyType, areaSqm?`${areaSqm}m²`:null, numRooms?`${numRooms} dhoma`:null].filter(Boolean).map((t,i) => (
                      <span key={i} style={{ fontSize:11, color:'rgba(240,236,228,0.45)', background:'rgba(240,236,228,0.06)', borderRadius:6, padding:'2px 8px' }}>📍{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p style={{ fontSize:13, color:'rgba(240,236,228,0.5)', lineHeight:1.7, borderTop:'1px solid rgba(240,236,228,0.07)', paddingTop:12 }}>{description}</p>
            </div>

            {/* Base summary */}
            <div style={{ background:'rgba(240,236,228,0.02)', border:'1px solid rgba(240,236,228,0.07)', borderRadius:16, overflow:'hidden' }}>
              <div style={{ padding:'11px 18px', borderBottom:'1px solid rgba(240,236,228,0.06)', fontSize:10, fontWeight:800, color:'rgba(240,236,228,0.3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Informacionet bazë</div>
              {([
                ['💰 Buxheti',       budgetMin||budgetMax ? `€${Number(budgetMin||0).toLocaleString()} – €${Number(budgetMax||'∞')}` : 'Fleksibël / të diskutojmë'],
                ['⏰ Urgjenca',      {urgent:'🔴 Urgjent',normal:'🟡 Normal',flexible:'🟢 Fleksibël'}[urgency]],
                ['📅 Afati i synuar',timelineWeeks || '—'],
                ['📦 Materialet',    hasMaterials===true?'I siguroj vetë':hasMaterials===false?'Profesionisti siguron':'—'],
                ['🤝 Ofertojnë',     {both:'Kompani & Punëtorë',company:'Vetëm kompani',worker:'Vetëm punëtorë'}[providerType]],
              ] as [string,string][]).map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'10px 18px', borderBottom:'1px solid rgba(240,236,228,0.05)', gap:12 }}>
                  <span style={{ fontSize:12, color:'rgba(240,236,228,0.4)' }}>{l}</span>
                  <span style={{ fontSize:12, fontWeight:600, textAlign:'right' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Category-specific summary */}
            {(() => {
              const filled = fields.filter(f => catFields[f.key] !== undefined && catFields[f.key] !== '' && catFields[f.key] !== null && !(Array.isArray(catFields[f.key]) && catFields[f.key].length===0))
              if (!filled.length) return null
              return (
                <div style={{ background:'rgba(240,236,228,0.02)', border:`1px solid ${accent}20`, borderRadius:16, overflow:'hidden' }}>
                  <div style={{ padding:'11px 18px', borderBottom:`1px solid ${accent}15`, fontSize:10, fontWeight:800, color:accent, textTransform:'uppercase', letterSpacing:'0.1em' }}>{cat.icon} {cat.name} — Detajet specifike</div>
                  {filled.map(f => {
                    const v = catFields[f.key]
                    const display = Array.isArray(v) ? v.join(', ') : String(v)
                    return (
                      <div key={f.key} style={{ display:'flex', justifyContent:'space-between', padding:'9px 18px', borderBottom:'1px solid rgba(240,236,228,0.04)', gap:12 }}>
                        <span style={{ fontSize:12, color:'rgba(240,236,228,0.4)' }}>{f.icon} {f.label}</span>
                        <span style={{ fontSize:12, fontWeight:600, color:accent, textAlign:'right', maxWidth:'55%' }}>{display}</span>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* 24h notice */}
            <div style={{ padding:'15px 18px', background:'rgba(232,98,26,0.05)', border:'1px solid rgba(232,98,26,0.2)', borderRadius:14, display:'flex', gap:12, alignItems:'flex-start' }}>
              <span style={{ fontSize:22, flexShrink:0 }}>⏱</span>
              <div>
                <div style={{ fontWeight:700, color:'#e8621a', fontSize:14, marginBottom:3 }}>24 orë afat për oferta</div>
                <div style={{ fontSize:12, color:'rgba(240,236,228,0.45)', lineHeight:1.65 }}>Pas postimit, profesionistët kanë 24 orë për të dërguar ofertat e tyre. Do të njoftoheni menjëherë për çdo ofertë të re.</div>
              </div>
            </div>
          </div>
        )}

        {/* ══ Navigation ══════════════════════════════════════════════════ */}
        <div style={{ display:'flex', gap:10, marginTop:32, paddingTop:20, borderTop:'1px solid rgba(240,236,228,0.06)' }}>
          {step > 0 && (
            <button onClick={() => { setError(''); setStep(s=>s-1); scrollTop() }}
              style={{ padding:'13px 22px', borderRadius:13, background:'rgba(240,236,228,0.05)', border:'1px solid rgba(240,236,228,0.1)', color:'rgba(240,236,228,0.6)', fontFamily:'inherit', fontSize:14, fontWeight:600, cursor:'pointer', transition:'all 0.2s', flexShrink:0 }}>
              ← Prapa
            </button>
          )}
          {step < TOTAL_STEPS - 1 ? (
            <button onClick={handleNext}
              style={{ flex:1, padding:'13px', borderRadius:13, background:`linear-gradient(135deg,${accent},${accent}bb)`, border:'none', color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', cursor:'pointer', boxShadow:`0 4px 20px ${accent}35`, transition:'all 0.2s' }}>
              Vazhdo →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              style={{ flex:1, padding:'13px', borderRadius:13, background:loading?'rgba(232,98,26,0.5)':'linear-gradient(135deg,#e8621a,#ff7c35)', border:'none', color:'#fff', fontFamily:"'Fraunces',serif", fontWeight:800, fontSize:'1rem', cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:loading?'none':'0 4px 20px rgba(232,98,26,0.35)', transition:'all 0.2s' }}>
              {loading
                ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>Duke postuar...</>
                : '🚀 Posto Aplikimin'}
            </button>
          )}
        </div>
      </div>
    </PageShell>
  )
}