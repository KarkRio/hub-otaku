// ═══════════════════════════════════════════
//  HUB OTAKU ∞ v2.0 — JavaScript Principal
// ═══════════════════════════════════════════

const DB = { anime:[], manga:[], games:[], news:[] };
let STATE = {
  tab:'anime', page:1, perPage:12, sort:'newest', type:'all', age:'all',
  search:'', view:'grid', editId:null, editCat:null, seasonsForm:[],
  curAnime:null, curSeason:null
};
let favorites = JSON.parse(localStorage.getItem('ho_favs')||'[]');
let watchlist = JSON.parse(localStorage.getItem('ho_wl')||'[]');
let notifications = JSON.parse(localStorage.getItem('ho_notifs')||'[]');
let itemId = 1;
let deferredInstall = null;
let aiHistory = [];
let jikanData = { anime:[], manga:[] };

// ═══════════════════════════════════════════
//  SERVICE WORKER (PWA)
// ═══════════════════════════════════════════
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js')
    .then(reg => console.log('SW registered'))
    .catch(err => console.log('SW error', err));
}

// ═══════════════════════════════════════════
//  DADOS & PERSISTÊNCIA
// ═══════════════════════════════════════════
function loadData(){
  const s = localStorage.getItem('ho_db');
  if(s){ const p=JSON.parse(s); Object.assign(DB, p.db||{}); itemId=p.id||1; }
  if(!DB.anime.length && !DB.manga.length && !DB.games.length && !DB.news.length){
    loadDemoData();
  }
}
function saveData(){ localStorage.setItem('ho_db', JSON.stringify({db:DB, id:itemId})); }
function saveFavs(){ localStorage.setItem('ho_favs', JSON.stringify(favorites)); }
function saveWL(){ localStorage.setItem('ho_wl', JSON.stringify(watchlist)); }
function saveNotifs(){ localStorage.setItem('ho_notifs', JSON.stringify(notifications)); }

function loadDemoData(){
  DB.anime = [
    {id:itemId++, title:"Demon Slayer: Kimetsu no Yaiba", image:"https://cdn.myanimelist.net/images/anime/1286/99889.jpg", releaseDate:"2019-04-06", ageRating:"16", type:"TV", rating:4.7, description:"Tanjiro Kamado embarca numa jornada para curar a irmã Nezuko, transformada em demónio, e vingar a família massacrada.", isNew:true, seasons:[{number:1, episodes:[{number:1,name:"Crueldade",duration:"23min",videoUrl:"dQw4w9WgXcQ"}]}]},
    {id:itemId++, title:"Attack on Titan", image:"https://cdn.myanimelist.net/images/anime/10/47347.jpg", releaseDate:"2013-04-07", ageRating:"18", type:"TV", rating:4.9, description:"Humanidade vive dentro de muralhas gigantes para se proteger de criaturas devoradoras de humanos chamadas Titãs.", seasons:[{number:1, episodes:[{number:1,name:"Para ti, 2000 anos no futuro",duration:"24min",videoUrl:"dQw4w9WgXcQ"}]}]},
    {id:itemId++, title:"One Piece", image:"https://cdn.myanimelist.net/images/anime/6/73245.jpg", releaseDate:"1999-10-20", ageRating:"12", type:"TV", rating:4.8, description:"Monkey D. Luffy e a tripulação dos Chapéus de Palha navegam pelos mares em busca do tesouro lendário One Piece.", seasons:[{number:1, episodes:[{number:1,name:"Eu sou Luffy!",duration:"24min",videoUrl:"dQw4w9WgXcQ"}]}]},
    {id:itemId++, title:"Jujutsu Kaisen", image:"https://cdn.myanimelist.net/images/anime/1171/109222.jpg", releaseDate:"2020-10-03", ageRating:"16", type:"TV", rating:4.6, description:"Yuji Itadori engole um dedo amaldiçoado e entra no mundo das maldições e feiticeiros jujutsu.", isNew:true, seasons:[{number:1, episodes:[{number:1,name:"Ryomen Sukuna",duration:"23min",videoUrl:"dQw4w9WgXcQ"}]}]},
    {id:itemId++, title:"My Hero Academia", image:"https://cdn.myanimelist.net/images/anime/10/78745.jpg", releaseDate:"2016-04-03", ageRating:"12", type:"TV", rating:4.5, description:"Num mundo onde 80% da população tem superpoderes, Izuku Midoriya sonha em ser um herói sem ter nenhum.", seasons:[{number:1, episodes:[{number:1,name:"Izuku Midoriya: Origem",duration:"24min",videoUrl:"dQw4w9WgXcQ"}]}]},
    {id:itemId++, title:"Death Note", image:"https://cdn.myanimelist.net/images/anime/9/9453.jpg", releaseDate:"2006-10-04", ageRating:"16", type:"TV", rating:4.8, description:"Light Yagura encontra um caderno sobrenatural que mata qualquer pessoa cujo nome seja escrito nele.", seasons:[{number:1, episodes:[{number:1,name:"Renascimento",duration:"22min",videoUrl:"dQw4w9WgXcQ"}]}]},
    {id:itemId++, title:"Steins;Gate", image:"https://cdn.myanimelist.net/images/anime/5/73199.jpg", releaseDate:"2011-04-06", ageRating:"16", type:"TV", rating:4.9, description:"Rintaro Okabe e seus amigos descobrem acidentalmente uma forma de enviar mensagens para o passado.", seasons:[{number:1, episodes:[{number:1,name:"Início e Fim",duration:"24min",videoUrl:"dQw4w9WgXcQ"}]}]},
    {id:itemId++, title:"Fullmetal Alchemist: Brotherhood", image:"https://cdn.myanimelist.net/images/anime/1223/96541.jpg", releaseDate:"2009-04-05", ageRating:"14", type:"TV", rating:5.0, description:"Os irmãos Elric usam alquimia para tentar ressuscitar a mãe, mas pagam um preço terrível.", seasons:[{number:1, episodes:[{number:1,name:"Alquimia de Aço",duration:"24min",videoUrl:"dQw4w9WgXcQ"}]}]},
    {id:itemId++, title:"Spy x Family", image:"https://cdn.myanimelist.net/images/anime/1441/122795.jpg", releaseDate:"2022-04-09", ageRating:"10", type:"TV", rating:4.6, description:"Um espião, uma assassina e uma telepata formam uma família falsa para uma missão secreta.", isNew:true, seasons:[{number:1, episodes:[{number:1,name:"Operação Strix",duration:"24min",videoUrl:"dQw4w9WgXcQ"}]}]},
    {id:itemId++, title:"Chainsaw Man", image:"https://cdn.myanimelist.net/images/anime/1806/126216.jpg", releaseDate:"2022-10-12", ageRating:"18", type:"TV", rating:4.7, description:"Denji, um jovem endividado, funde-se com o seu cão demónio Pochita para se tornar o Chainsaw Man.", isNew:true, seasons:[{number:1, episodes:[{number:1,name:"Cão e Motosserra",duration:"23min",videoUrl:"dQw4w9WgXcQ"}]}]},
    {id:itemId++, title:"Hunter x Hunter (2011)", image:"https://cdn.myanimelist.net/images/anime/11/33657.jpg", releaseDate:"2011-10-02", ageRating:"14", type:"TV", rating:4.8, description:"Gon Freecss embarca numa jornada para se tornar um Hunter e encontrar o seu pai desaparecido.", seasons:[{number:1, episodes:[{number:1,name:"A Jornada de Gon",duration:"23min",videoUrl:"dQw4w9WgXcQ"}]}]},
    {id:itemId++, title:"Vinland Saga", image:"https://cdn.myanimelist.net/images/anime/1500/103005.jpg", releaseDate:"2019-07-08", ageRating:"18", type:"TV", rating:4.7, description:"Thorfinn, um jovem viking, busca vingança contra Askeladd, o assassino do seu pai.", seasons:[{number:1, episodes:[{number:1,name:"Somewhere Not Here",duration:"24min",videoUrl:"dQw4w9WgXcQ"}]}]}
  ];
  DB.manga = [
    {id:itemId++, title:"Berserk", image:"https://cdn.myanimelist.net/images/manga/1/157897.jpg", releaseDate:"1989-08-25", ageRating:"18", type:"Seinen", rating:5.0, description:"Guts, o Espadachim Negro, luta contra demónios e humanos num mundo medieval sombrio.", chapters:364, status:"Hiato"},
    {id:itemId++, title:"One Piece", image:"https://cdn.myanimelist.net/images/manga/2/253146.jpg", releaseDate:"1997-07-22", ageRating:"12", type:"Shounen", rating:4.9, description:"A épica jornada de Luffy e os Chapéus de Palha em busca do One Piece.", chapters:1100, status:"Em andamento"},
    {id:itemId++, title:"Vagabond", image:"https://cdn.myanimelist.net/images/manga/1/209370.jpg", releaseDate:"1998-09-03", ageRating:"18", type:"Seinen", rating:4.9, description:"Baseado na vida do lendário espadachim Miyamoto Musashi.", chapters:327, status:"Hiato"},
    {id:itemId++, title:"Monster", image:"https://cdn.myanimelist.net/images/manga/3/258224.jpg", releaseDate:"1994-12-05", ageRating:"16", type:"Seinen", rating:4.8, description:"Dr. Kenzo Tenma persegue o paciente que salvou, um psicopata que se tornou um assassino em série.", chapters:162, status:"Completo"},
    {id:itemId++, title:"Slam Dunk", image:"https://cdn.myanimelist.net/images/manga/2/157904.jpg", releaseDate:"1990-10-01", ageRating:"12", type:"Shounen", rating:4.7, description:"Hanamichi Sakuragi descobre o basquetebol e transforma a equipa do Shohoku.", chapters:276, status:"Completo"},
    {id:itemId++, title:"20th Century Boys", image:"https://cdn.myanimelist.net/images/manga/5/26096.jpg", releaseDate:"1999-09-29", ageRating:"16", type:"Seinen", rating:4.7, description:"Kenji Endo e os seus amigos de infância descobrem que um culto apocalíptico está a usar os seus jogos de criança.", chapters:249, status:"Completo"}
  ];
  DB.games = [
    {id:itemId++, title:"Genshin Impact", image:"https://image.api.playstation.com/vulcan/img/cfn/11307uYG0CXzRuA9aryByTHYpQLxZWsdyCjDP0vog0B5d9B.jpg", releaseDate:"2020-09-28", ageRating:"12", type:"RPG", rating:4.5, description:"RPG de ação em mundo aberto com elementos gacha e visual anime impressionante.", platform:"PC, Mobile, PS4/5", developer:"miHoYo"},
    {id:itemId++, title:"Honkai: Star Rail", image:"https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/2d3debd121b0c73224c0a1649d6b5c21d982a515.jpg", releaseDate:"2023-04-26", ageRating:"12", type:"RPG", rating:4.7, description:"RPG por turnos espacial da miHoYo com história épica e personagens memoráveis.", platform:"PC, Mobile, PS5", developer:"miHoYo"},
    {id:itemId++, title:"Persona 5 Royal", image:"https://image.api.playstation.com/vulcan/img/cfn/11307x4b5XDHqStD2qgbEfVOBX1e7sCt.png", releaseDate:"2019-10-31", ageRating:"16", type:"RPG", rating:4.9, description:"O ápice dos JRPGs modernos. Estilo visual único e narrativa envolvente.", platform:"PC, PS4/5, Switch, Xbox", developer:"Atlus"},
    {id:itemId++, title:"Elden Ring", image:"https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/phvVT0qZfcRms5qDAk0SI3CM.png", releaseDate:"2022-02-25", ageRating:"18", type:"RPG", rating:4.8, description:"Dark Souls em mundo aberto. Colaboração entre FromSoftware e George R.R. Martin.", platform:"PC, PS4/5, Xbox", developer:"FromSoftware"},
    {id:itemId++, title:"Danganronpa V3", image:"https://upload.wikimedia.org/wikipedia/en/3/3f/Danganronpa_V3_Killing_Harmony_Cover.jpg", releaseDate:"2017-01-12", ageRating:"16", type:"Visual Novel", rating:4.6, description:"Visual novel de mistério e assassinato com personagens únicos e reviravoltas.", platform:"PC, PS4, Switch", developer:"Spike Chunsoft"},
    {id:itemId++, title:"Final Fantasy XVI", image:"https://image.api.playstation.com/vulcan/ap/rnd/202211/0901/1DkXeW0onb2R0j4L4d6e0b0X.jpg", releaseDate:"2023-06-22", ageRating:"18", type:"RPG", rating:4.4, description:"A mais recente entrada na lendária série Final Fantasy com combate em tempo real.", platform:"PS5, PC", developer:"Square Enix"}
  ];
  DB.news = [
    {id:itemId++, title:"Demon Slayer: Novo Arco Anunciado para 2026", image:"https://cdn.myanimelist.net/images/anime/1286/99889.jpg", releaseDate:"2026-06-05", ageRating:"L", type:"Anime", rating:null, description:"O anime mais popular dos últimos anos retorna com um novo arco épico. Ufotable promete animação de nível cinematográfico.", author:"Hub Otaku", newsContent:"Ufotable confirmou hoje que está a trabalhar num novo arco de Demon Slayer, previsto para 2026."},
    {id:itemId++, title:"One Piece: Live Action Temporada 2 Confirmada", image:"https://cdn.myanimelist.net/images/anime/6/73245.jpg", releaseDate:"2026-06-04", ageRating:"L", type:"Live Action", rating:null, description:"Netflix anuncia data de estreia para a segunda temporada do live action de One Piece.", author:"Hub Otaku", newsContent:"Netflix confirmou que a segunda temporada de One Piece Live Action estreia em novembro de 2026."},
    {id:itemId++, title:"Studio Ghibli: Novo Filme em Produção", image:"https://cdn.myanimelist.net/images/anime/5/73199.jpg", releaseDate:"2026-06-03", ageRating:"L", type:"Cinema", rating:null, description:"Hayao Miyazaki está de volta com um novo projeto secreto.", author:"Hub Otaku", newsContent:"Fontes próximas ao Studio Ghibli indicam que Hayao Miyazaki está a trabalhar num novo projeto."},
    {id:itemId++, title:"Chainsaw Man: Parte 2 do Anime Confirmada", image:"https://cdn.myanimelist.net/images/anime/1806/126216.jpg", releaseDate:"2026-06-02", ageRating:"L", type:"Anime", rating:null, description:"Mappa Studios confirma produção da segunda parte do anime.", author:"Hub Otaku", newsContent:"A Mappa Studios confirmou oficialmente a produção da segunda parte de Chainsaw Man."},
    {id:itemId++, title:"Nintendo Switch 2: Jogos Japoneses Confirmados", image:"https://image.api.playstation.com/vulcan/ap/rnd/202306/1219/2d3debd121b0c73224c0a1649d6b5c21d982a515.jpg", releaseDate:"2026-06-01", ageRating:"L", type:"Jogos", rating:null, description:"Nintendo revela lineup impressionante de jogos com temática japonesa.", author:"Hub Otaku", newsContent:"A Nintendo apresentou um lineup impressionante para o Switch 2."},
    {id:itemId++, title:"Solo Leveling: Segunda Temporada Estreia em Julho", image:"https://cdn.myanimelist.net/images/anime/1171/109222.jpg", releaseDate:"2026-05-30", ageRating:"L", type:"Anime", rating:null, description:"A-1 Pictures confirma data de estreia para a segunda temporada.", author:"Hub Otaku", newsContent:"A A-1 Pictures confirmou que a segunda temporada de Solo Leveling estreia em julho de 2026."}
  ];
  saveData();
}

// ═══════════════════════════════════════════
//  API JIKAN (DADOS REAIS DO MYANIMELIST)
// ═══════════════════════════════════════════
async function fetchJikanAnime(){
  try{
    const res = await fetch('https://api.jikan.moe/v4/top/anime?limit=12');
    const data = await res.json();
    if(data.data){
      jikanData.anime = data.data.map(a => ({
        id: a.mal_id + 10000,
        title: a.title,
        image: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url,
        releaseDate: a.aired?.from?.split('T')[0] || '2020-01-01',
        ageRating: a.rating?.includes('R17') ? '18' : a.rating?.includes('R') ? '16' : '12',
        type: a.type || 'TV',
        rating: (a.score / 2).toFixed(1),
        description: a.synopsis || 'Sem sinopse disponível.',
        isNew: a.year >= 2024,
        _source: 'jikan'
      }));
      // Merge com DB local
      jikanData.anime.forEach(ja => {
        if(!DB.anime.find(a => a.title === ja.title)){
          DB.anime.push({...ja, id: itemId++, seasons:[]});
        }
      });
      saveData();
      renderCards();
      updateStats();
    }
  }catch(e){ console.log('Jikan API error:', e); }
}

async function fetchJikanManga(){
  try{
    const res = await fetch('https://api.jikan.moe/v4/top/manga?limit=8');
    const data = await res.json();
    if(data.data){
      jikanData.manga = data.data.map(m => ({
        id: m.mal_id + 20000,
        title: m.title,
        image: m.images?.jpg?.large_image_url || m.images?.jpg?.image_url,
        releaseDate: m.published?.from?.split('T')[0] || '2010-01-01',
        ageRating: '14',
        type: m.type || 'Mangá',
        rating: (m.score / 2).toFixed(1),
        description: m.synopsis || 'Sem sinopse disponível.',
        chapters: m.chapters || 0,
        status: m.status === 'Finished' ? 'Completo' : 'Em andamento',
        _source: 'jikan'
      }));
      jikanData.manga.forEach(jm => {
        if(!DB.manga.find(m => m.title === jm.title)){
          DB.manga.push({...jm, id: itemId++});
        }
      });
      saveData();
      renderCards();
      updateStats();
    }
  }catch(e){ console.log('Jikan manga error:', e); }
}

// ═══════════════════════════════════════════
//  PARTÍCULAS SAKURA
// ═══════════════════════════════════════════
(function(){
  const cv = document.getElementById('pcanvas');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  let particles = [];
  function resize(){ cv.width = window.innerWidth; cv.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, {passive:true});
  class P {
    constructor(){ this.reset(true); }
    reset(init){
      this.x = Math.random() * cv.width;
      this.y = init ? Math.random() * cv.height : -10;
      this.r = Math.random() * 3 + 1;
      this.sp = Math.random() * 0.6 + 0.3;
      this.sx = Math.sin(Math.random() * 6.28) * 0.4;
      this.op = Math.random() * 0.5 + 0.2;
      this.rot = Math.random() * 360;
      this.rs = Math.random() * 1.5 - 0.75;
      this.hue = Math.random() < 0.5 ? 345 : 200;
    }
    update(){ this.y += this.sp; this.x += this.sx; this.rot += this.rs; if(this.y > cv.height + 10) this.reset(false); }
    draw(){
      ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.rot * Math.PI / 180);
      ctx.globalAlpha = this.op; ctx.fillStyle = `hsl(${this.hue},80%,70%)`;
      ctx.beginPath(); ctx.ellipse(0, 0, this.r, this.r * 1.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  for(let i = 0; i < 70; i++) particles.push(new P());
  function animate(){ ctx.clearRect(0, 0, cv.width, cv.height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animate); }
  animate();
})();

// ═══════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════
function toast(msg, type='info', icon=''){
  const b = document.getElementById('toast-box');
  if(!b) return;
  const ic = icon || (type==='success'?'✅':type==='error'?'❌':type==='warning'?'⚠️':'💬');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${ic}</span><span>${msg}</span>`;
  b.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 3000);
}

// ═══════════════════════════════════════════
//  HEADER SCROLL
// ═══════════════════════════════════════════
window.addEventListener('scroll', () => {
  const hdr = document.getElementById('hdr');
  if(hdr) hdr.classList.toggle('scrolled', window.scrollY > 30);
}, {passive:true});

// ═══════════════════════════════════════════
//  RENDER CARDS
// ═══════════════════════════════════════════
const tabLabels = {anime:'⚡ Animes', manga:'📖 Mangás', games:'🎮 Jogos', news:'📰 Notícias', favorites:'❤️ Favoritos'};
const typeOptsByTab = {
  anime: ['all','TV','Filme','OVA','ONA','Especial','Shounen','Shoujo','Seinen','Josei','Isekai'],
  manga: ['all','Mangá','Manhwa','Manhua','Light Novel','Shounen','Shoujo','Seinen'],
  games: ['all','RPG','Ação','Aventura','Fighting','Visual Novel','Strategy','MMORPG'],
  news: ['all','Anime','Mangá','Games','Indústria','Evento','Lançamento']
};

function getItems(){
  let items;
  if(STATE.tab === 'favorites'){
    items = [];
    ['anime','manga','games','news'].forEach(cat => {
      (DB[cat]||[]).forEach(it => { if(favorites.includes(it.id)) items.push({...it, _cat:cat}); });
    });
  } else {
    items = (DB[STATE.tab]||[]).map(it => ({...it, _cat:STATE.tab}));
  }
  if(STATE.search){
    const q = STATE.search.toLowerCase();
    items = items.filter(it => it.title && it.title.toLowerCase().includes(q));
  }
  if(STATE.type !== 'all') items = items.filter(it => it.type === STATE.type);
  if(STATE.age !== 'all') items = items.filter(it => it.ageRating === STATE.age);
  if(STATE.sort === 'newest') items.sort((a,b) => new Date(b.releaseDate||0) - new Date(a.releaseDate||0));
  else if(STATE.sort === 'oldest') items.sort((a,b) => new Date(a.releaseDate||0) - new Date(b.releaseDate||0));
  else if(STATE.sort === 'title') items.sort((a,b) => (a.title||'').localeCompare(b.title||''));
  else if(STATE.sort === 'rating') items.sort((a,b) => (b.rating||0) - (a.rating||0));
  return items;
}

function renderCards(){
  const grid = document.getElementById('cgrid');
  if(!grid) return;
  const items = getItems();
  const total = items.length;
  const start = (STATE.page - 1) * STATE.perPage;
  const page = items.slice(start, start + STATE.perPage);

  const stl = document.getElementById('sec-title-lbl');
  if(stl) stl.textContent = tabLabels[STATE.tab] || '';

  if(page.length === 0){
    grid.innerHTML = `<div class="empty"><div class="empty-ico">🔍</div><div class="empty-t">Nenhum conteúdo encontrado</div><div class="empty-s">Adicione itens no painel Admin ou ajuste os filtros.</div></div>`;
    document.getElementById('pag').innerHTML = '';
    return;
  }

  grid.innerHTML = '';
  page.forEach(item => {
    const fav = favorites.includes(item.id);
    const wl = watchlist.find(w => w.id === item.id);
    const prog = wl && wl.total > 0 ? Math.round((wl.watched / wl.total) * 100) : 0;
    const div = document.createElement('div');
    div.className = 'card';
    div.setAttribute('tabindex', '0');
    div.setAttribute('role', 'article');
    div.setAttribute('aria-label', item.title || 'Item sem título');
    div.innerHTML = `
      <div class="card-in">
        <div class="cimg-wrap">
          <img class="cimg" src="${item.image || 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg'}" alt="Capa de ${item.title || ''}" loading="lazy" onerror="this.src='https://cdn.myanimelist.net/images/anime/1286/99889.jpg'">
          <div class="cov">
            <div class="cqa">
              <button class="cqb play" data-id="${item.id}" data-cat="${item._cat}" title="Ver detalhes" aria-label="Ver detalhes de ${item.title || ''}"><i class="fas fa-play" aria-hidden="true"></i></button>
              <button class="cqb fav${fav ? ' on' : ''}" data-id="${item.id}" title="Favoritar" aria-label="${fav ? 'Remover dos' : 'Adicionar aos'} favoritos" aria-pressed="${fav}"><i class="fas fa-heart" aria-hidden="true"></i></button>
              <button class="cqb info" data-id="${item.id}" data-cat="${item._cat}" title="Info rápida" aria-label="Informações de ${item.title || ''}"><i class="fas fa-info" aria-hidden="true"></i></button>
            </div>
          </div>
          <div class="cbadges">
            ${item.isNew ? '<span class="bng bnew">NEW</span>' : ''}
            ${item.type ? `<span class="bng btype">${item.type}</span>` : ''}
          </div>
          ${item.ageRating ? `<span class="bage a${item.ageRating}">${item.ageRating}</span>` : ''}
        </div>
        <div class="cbody">
          <div class="ctitle">${item.title || 'Sem título'}</div>
          <div class="cmeta">
            ${item.releaseDate ? `<span class="cmeta-i"><i class="fas fa-calendar-alt" aria-hidden="true"></i>${item.releaseDate.slice(0,4)}</span>` : ''}
            ${item.rating ? `<span class="cmeta-i crating"><i class="fas fa-star" aria-hidden="true"></i>${item.rating}</span>` : ''}
            ${item._cat === 'anime' && item.seasons ? `<span class="cmeta-i"><i class="fas fa-film" aria-hidden="true"></i>${item.seasons.length} temp.</span>` : ''}
            ${item._cat === 'manga' && item.chapters ? `<span class="cmeta-i"><i class="fas fa-book-open" aria-hidden="true"></i>${item.chapters} caps</span>` : ''}
            ${item._cat === 'games' && item.platform ? `<span class="cmeta-i"><i class="fas fa-gamepad" aria-hidden="true"></i>${item.platform}</span>` : ''}
          </div>
          ${wl && wl.total > 0 ? `<div class="prog-wrap" aria-label="Progresso ${prog}%"><div class="prog-fill" style="width:${prog}%"></div></div>` : ''}
          <div class="cfooter">
            <span class="genre-tag">${item._cat}</span>
            <div style="display:flex;gap:6px">
              <button class="cqb fav${fav ? ' on' : ''}" style="width:28px;height:28px;font-size:.72rem" data-id="${item.id}" title="Favoritar" aria-label="${fav ? 'Remover dos' : 'Adicionar aos'} favoritos" aria-pressed="${fav}"><i class="fas fa-heart" aria-hidden="true"></i></button>
              <button class="cqb info" style="width:28px;height:28px;font-size:.72rem;background:rgba(255,255,255,.06)" data-id="${item.id}" data-cat="${item._cat}" title="Editar" aria-label="Editar ${item.title || ''}"><i class="fas fa-pen" aria-hidden="true"></i></button>
            </div>
          </div>
        </div>
      </div>`;
    div.querySelector('.cqb.play').addEventListener('click', e => { e.stopPropagation(); openDetail(item.id, item._cat); });
    div.querySelectorAll('.cqb.fav').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); toggleFav(item.id, b); }));
    div.querySelectorAll('.cqb.info').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); openDetail(item.id, item._cat); }));
    div.addEventListener('click', () => openDetail(item.id, item._cat));
    div.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(item.id, item._cat); } });
    grid.appendChild(div);
  });
  renderPag(total);
  updateStats();
}

function renderPag(total){
  const pages = Math.ceil(total / STATE.perPage);
  const pag = document.getElementById('pag');
  if(!pag) return;
  if(pages <= 1){ pag.innerHTML = ''; return; }
  let html = `<button class="pbtn" onclick="goPage(${STATE.page-1})" ${STATE.page <= 1 ? 'disabled' : ''} aria-label="Página anterior"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>`;
  for(let i = 1; i <= pages; i++){
    if(pages > 7 && Math.abs(i - STATE.page) > 2 && i !== 1 && i !== pages){ if(i === 2 || i === pages-1) html += '<span style="color:var(--t3)">…</span>'; continue; }
    html += `<button class="pbtn${i === STATE.page ? ' on' : ''}" onclick="goPage(${i})" aria-label="Página ${i}" ${i === STATE.page ? 'aria-current="page"' : ''}>${i}</button>`;
  }
  html += `<button class="pbtn" onclick="goPage(${STATE.page+1})" ${STATE.page >= pages ? 'disabled' : ''} aria-label="Próxima página"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>`;
  pag.innerHTML = html;
}
function goPage(p){ STATE.page = p; renderCards(); window.scrollTo({top: document.getElementById('main-anchor').offsetTop - 80, behavior:'smooth'}); }

function updateStats(){
  ['anime','manga','games','news'].forEach(k => {
    const n = (DB[k] || []).length;
    ['hstat-','st-'].forEach(p => { const el = document.getElementById(p + k); if(el) el.textContent = n; });
  });
}

// ═══════════════════════════════════════════
//  FAVORITES
// ═══════════════════════════════════════════
function toggleFav(id, btn){
  const idx = favorites.indexOf(id);
  if(idx === -1){
    favorites.push(id);
    if(btn) btn.classList.add('on');
    toast('Adicionado aos favoritos!', 'success', '❤️');
    addNotif('❤️', 'Novo favorito adicionado', 'Você adicionou um item aos favoritos.', 'ni-p');
  } else {
    favorites.splice(idx, 1);
    if(btn) btn.classList.remove('on');
    toast('Removido dos favoritos', 'info', '💔');
  }
  saveFavs();
  if(STATE.tab === 'favorites') renderCards();
}

// ═══════════════════════════════════════════
//  WATCHLIST
// ═══════════════════════════════════════════
function toggleWL(item){
  const idx = watchlist.findIndex(w => w.id === item.id);
  if(idx === -1){
    const total = item.seasons ? item.seasons.reduce((acc, s) => acc + (s.episodes || []).length, 0) : 0;
    watchlist.push({id: item.id, title: item.title, image: item.image, cat: item._cat, status: 'Quero ver', watched: 0, total: total});
    saveWL();
    toast('Adicionado à Watchlist!', 'success', '📋');
  } else {
    toast('Já está na sua Watchlist', 'info', '📋');
  }
  renderWatchlist();
}
function renderWatchlist(){
  const ct = document.getElementById('wl-list');
  if(!ct) return;
  if(!watchlist.length){ ct.innerHTML = '<div class="wl-empty"><div style="font-size:2.5rem;margin-bottom:10px;opacity:.3">📋</div><div style="color:var(--t3)">Watchlist vazia. Adicione itens!</div></div>'; return; }
  ct.innerHTML = watchlist.map((w, i) => {
    const prog = w.total > 0 ? Math.round((w.watched / w.total) * 100) : 0;
    return `<div class="wl-item">
      <img class="wl-img" src="${w.image || ''}" alt="" onerror="this.style.display='none'" loading="lazy">
      <div class="wl-info">
        <div class="wl-title">${w.title || ''}</div>
        <div style="display:flex;gap:7px;align-items:center;margin-bottom:4px">
          <span class="wl-status wls-${w.status==='Assistindo'?'aw':w.status==='Quero ver'?'w':'d'}">${w.status}</span>
          <span style="font-size:.7rem;color:var(--t3)">${w.cat}</span>
        </div>
        ${w.total > 0 ? `<div class="wl-prog-row"><span style="font-size:.7rem;color:var(--t3)">${w.watched}/${w.total} eps · ${prog}%</span><div class="wl-prog-bar"><div class="wl-prog-fill" style="width:${prog}%"></div></div></div>` : ''}
      </div>
      <select onchange="changeWLStatus(${i},this.value)" style="font-size:.7rem;background:var(--bg3);border:1px solid var(--bd);color:var(--t2);padding:4px 6px;border-radius:var(--rxs)" aria-label="Status">
        <option${w.status==='Quero ver'?' selected':''}>Quero ver</option>
        <option${w.status==='Assistindo'?' selected':''}>Assistindo</option>
        <option${w.status==='Completo'?' selected':''}>Completo</option>
      </select>
      <button class="del-btn" onclick="removeWL(${i})" aria-label="Remover da watchlist"><i class="fas fa-times" aria-hidden="true"></i></button>
    </div>`;
  }).join('');
}
function changeWLStatus(i, v){ watchlist[i].status = v; saveWL(); renderWatchlist(); }
function removeWL(i){ watchlist.splice(i, 1); saveWL(); renderWatchlist(); toast('Removido da Watchlist', 'info'); }

// ═══════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════
function addNotif(icon, title, sub, cls='ni-p'){
  notifications.unshift({icon, title, sub, cls, unread: true, time: new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})});
  if(notifications.length > 20) notifications.pop();
  saveNotifs();
  updateNotifDot();
  renderNotifs();
}
function updateNotifDot(){
  const dot = document.getElementById('notif-dot');
  if(!dot) return;
  const unread = notifications.filter(n => n.unread).length;
  dot.style.display = unread > 0 ? 'block' : 'none';
}
function renderNotifs(){
  const ct = document.getElementById('notif-list');
  if(!ct) return;
  if(!notifications.length){ ct.innerHTML = '<div style="padding:40px 20px;text-align:center;color:var(--t3);font-size:.84rem">Sem notificações</div>'; return; }
  ct.innerHTML = notifications.map((n, i) => `
    <div class="notif-item${n.unread ? ' unread' : ''}" role="listitem">
      <div class="notif-ico-w ${n.cls}">${n.icon}</div>
      <div class="notif-info">
        <div class="notif-t">${n.title}</div>
        <div class="notif-s">${n.sub} · ${n.time}</div>
      </div>
      ${n.unread ? '<div class="unread-dot" aria-label="Não lida"></div>' : ''}
    </div>`).join('');
}

// ═══════════════════════════════════════════
//  DETAIL MODAL
// ═══════════════════════════════════════════
function openDetail(id, cat){
  const items = DB[cat] || [];
  const item = items.find(it => it.id === id);
  if(!item) return;
  const fav = favorites.includes(id);
  const wl = watchlist.find(w => w.id === id);
  const mImg = document.getElementById('m-img');
  const mTitle = document.getElementById('m-title');
  const mTags = document.getElementById('m-tags');
  const mMeta = document.getElementById('m-meta');
  const mDesc = document.getElementById('m-desc');
  const mMedia = document.getElementById('m-media');
  const mActs = document.getElementById('m-acts');

  if(mImg){ mImg.src = item.image || ''; mImg.alt = `Capa de ${item.title || ''}`; }
  if(mTitle) mTitle.textContent = item.title || '';
  if(mTags){
    mTags.innerHTML = '';
    if(item.isNew) mTags.innerHTML += `<span class="bng bnew">NEW</span>`;
    if(item.type) mTags.innerHTML += `<span class="bng btype">${item.type}</span>`;
    if(item.ageRating) mTags.innerHTML += `<span class="bng bage a${item.ageRating}">${item.ageRating}</span>`;
  }
  if(mMeta){
    mMeta.innerHTML = '';
    if(item.releaseDate) mMeta.innerHTML += `<span class="mhero-mi"><i class="fas fa-calendar" aria-hidden="true"></i>${item.releaseDate}</span>`;
    if(item.rating) mMeta.innerHTML += `<span class="mhero-mi"><i class="fas fa-star" style="color:var(--g)" aria-hidden="true"></i>${item.rating}/5</span>`;
    if(item.seasons) mMeta.innerHTML += `<span class="mhero-mi"><i class="fas fa-film" aria-hidden="true"></i>${item.seasons.length} temp.</span>`;
    if(item.chapters) mMeta.innerHTML += `<span class="mhero-mi"><i class="fas fa-book-open" aria-hidden="true"></i>${item.chapters} caps</span>`;
    if(item.platform) mMeta.innerHTML += `<span class="mhero-mi"><i class="fas fa-gamepad" aria-hidden="true"></i>${item.platform}</span>`;
    if(item.developer) mMeta.innerHTML += `<span class="mhero-mi"><i class="fas fa-code" aria-hidden="true"></i>${item.developer}</span>`;
  }
  if(mDesc) mDesc.textContent = item.description || 'Sem descrição disponível.';
  if(mMedia){
    if(item.video){
      const isUrl = item.video.startsWith('http');
      mMedia.style.display = 'block';
      mMedia.innerHTML = `<iframe src="${isUrl ? item.video : `https://www.youtube.com/embed/${item.video}?rel=0`}" allowfullscreen loading="lazy" title="Trailer de ${item.title || ''}"></iframe>`;
    } else { mMedia.style.display = 'none'; mMedia.innerHTML = ''; }
  }
  if(mActs){
    mActs.innerHTML = '';
    if(cat === 'anime' && item.seasons && item.seasons.length){
      mActs.innerHTML += `<button class="mbtn mp" onclick="openSeasons(${id},'${cat}')"><i class="fas fa-play" aria-hidden="true"></i> Assistir</button>`;
    } else if(item.video){
      mActs.innerHTML += `<button class="mbtn mp" onclick="openVideoPlayer('${item.video}','${item.title}')"><i class="fas fa-play" aria-hidden="true"></i> Assistir</button>`;
    }
    mActs.innerHTML += `<button class="mbtn${fav ? ' mp' : ' ms'}" id="det-fav-btn" onclick="toggleFavDetail(${id},'${cat}')"><i class="fas fa-heart" aria-hidden="true"></i> ${fav ? 'Favorito' : 'Favoritar'}</button>`;
    mActs.innerHTML += `<button class="mbtn mc" onclick="toggleWL({id:${id},title:'${(item.title||'').replace(/'/g,"\'")}',image:'${item.image||''}',_cat:'${cat}',seasons:${JSON.stringify(item.seasons||null)}})"><i class="fas fa-plus" aria-hidden="true"></i> ${wl ? 'Na Watchlist' : 'Watchlist'}</button>`;
    if(item.externalUrl) mActs.innerHTML += `<a class="mbtn ms" href="${item.externalUrl}" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt" aria-hidden="true"></i> Ver mais</a>`;
    mActs.innerHTML += `<button class="mbtn ms" onclick="openAdminEdit(${id},'${cat}')"><i class="fas fa-pen" aria-hidden="true"></i> Editar</button>`;
    mActs.innerHTML += `<button class="mbtn md" onclick="deleteItem(${id},'${cat}')"><i class="fas fa-trash" aria-hidden="true"></i> Deletar</button>`;
  }
  openOv('det-ov');
}
function toggleFavDetail(id, cat){
  const fav = favorites.includes(id);
  if(!fav){ favorites.push(id); toast('Adicionado aos favoritos!', 'success', '❤️'); }
  else { favorites.splice(favorites.indexOf(id), 1); toast('Removido dos favoritos', 'info', '💔'); }
  saveFavs();
  const btn = document.getElementById('det-fav-btn');
  if(btn){ btn.className = `mbtn${!fav ? ' mp' : ' ms'}`; btn.innerHTML = `<i class="fas fa-heart" aria-hidden="true"></i> ${!fav ? 'Favorito' : 'Favoritar'}`; }
  if(STATE.tab === 'favorites') renderCards();
}
function deleteItem(id, cat){
  if(!confirm('Deletar este item?')) return;
  DB[cat] = DB[cat].filter(it => it.id !== id);
  favorites = favorites.filter(f => f !== id);
  saveFavs(); saveData();
  closeOv('det-ov');
  renderCards();
  toast('Item deletado', 'success', '🗑️');
}

// ═══════════════════════════════════════════
//  SEASONS / EPISODES / PLAYER
// ═══════════════════════════════════════════
function openSeasons(id, cat){
  const item = (DB[cat] || []).find(it => it.id === id);
  if(!item || !item.seasons) return;
  STATE.curAnime = item;
  closeOv('det-ov');
  const grid = document.getElementById('sea-grid');
  const st = document.getElementById('sea-title');
  if(st) st.textContent = item.title || 'Temporadas';
  if(grid){
    grid.innerHTML = '';
    item.seasons.forEach(s => {
      const div = document.createElement('div'); div.className = 'sea-card';
      div.innerHTML = `<div class="sea-num">T${s.number || 1}</div><div class="sea-eps">${(s.episodes || []).length} episódios</div><button class="sea-btn">Selecionar</button>`;
      div.querySelector('.sea-btn').addEventListener('click', () => openEpisodes(s, item));
      grid.appendChild(div);
    });
  }
  openFP('sea-page');
}
function openEpisodes(season, anime){
  STATE.curSeason = season;
  const et = document.getElementById('ep-title');
  if(et) et.textContent = `${anime.title} — Temporada ${season.number || 1}`;
  const grid = document.getElementById('ep-grid');
  if(grid){
    grid.innerHTML = '';
    (season.episodes || []).forEach(ep => {
      const div = document.createElement('div'); div.className = 'ep-card';
      div.innerHTML = `<div class="ep-num">EP<br>${ep.number || ''}</div><div class="ep-info"><div class="ep-name">${ep.name || 'Episódio ' + ep.number}</div><div class="ep-dur">${ep.duration || ''}</div></div><button class="ep-play" aria-label="Reproduzir episódio ${ep.number || ''}"><i class="fas fa-play" aria-hidden="true"></i></button>`;
      div.addEventListener('click', () => openVideoPlayer(ep.videoUrl || '', ep.name || anime.title));
      grid.appendChild(div);
    });
  }
  closeFP('sea-page');
  openFP('ep-page');
}
function openVideoPlayer(url, title){
  const vt = document.getElementById('vp-title');
  if(vt) vt.textContent = title || 'Assistindo';
  const vp = document.getElementById('vplayer');
  const help = document.getElementById('vp-help');
  const direct = document.getElementById('vp-direct');
  if(!url){ 
    if(vp) vp.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--t2)">Vídeo não disponível</div>'; 
    if(help) help.style.display = 'none'; 
    return; 
  }
  let src = url;
  if(!url.startsWith('http')){ src = `https://www.youtube.com/embed/${url}?autoplay=1&rel=0`; }
  if(vp) vp.innerHTML = `<iframe src="${src}" allowfullscreen allow="autoplay; fullscreen" loading="lazy" title="Reproduzindo ${title || ''}"></iframe>`;
  if(direct){ direct.href = url; direct.textContent = 'Abrir em nova aba'; }
  if(help) help.style.display = 'block';
  closeFP('ep-page');
  closeFP('sea-page');
  openFP('vp-page');
}
function openFP(id){ const el = document.getElementById(id); if(el){ el.classList.add('open'); document.body.style.overflow = 'hidden'; } }
function closeFP(id){ const el = document.getElementById(id); if(el){ el.classList.remove('open'); } }

// ═══════════════════════════════════════════
//  OVERLAY HELPERS
// ═══════════════════════════════════════════
function openOv(id){ const el = document.getElementById(id); if(el){ el.classList.add('open'); document.body.style.overflow = 'hidden'; } }
function closeOv(id){ const el = document.getElementById(id); if(el){ el.classList.remove('open'); document.body.style.overflow = ''; } }

document.querySelectorAll('.ov').forEach(ov => {
  ov.addEventListener('click', e => { if(e.target === ov) closeOv(ov.id); });
});
['det-x','ai-x','wl-x','rand-x','adm-x'].forEach(id => {
  const el = document.getElementById(id);
  if(el) el.addEventListener('click', () => closeOv(id.replace('-x','-ov')));
});
const notifOv = document.getElementById('notif-ov');
if(notifOv) notifOv.addEventListener('click', e => { if(e.target === notifOv) closeOv('notif-ov'); });

// ═══════════════════════════════════════════
//  RANDOM
// ═══════════════════════════════════════════
const spinBtn = document.getElementById('spin-btn');
if(spinBtn){
  spinBtn.addEventListener('click', () => {
    const all = [];
    ['anime','manga','games','news'].forEach(cat => (DB[cat] || []).forEach(it => all.push({...it, _cat:cat})));
    if(!all.length){ toast('Adicione conteúdo primeiro!', 'warning'); return; }
    spinBtn.classList.add('spinning');
    setTimeout(() => spinBtn.classList.remove('spinning'), 400);
    const item = all[Math.floor(Math.random() * all.length)];
    const res = document.getElementById('rand-result');
    if(res){
      res.style.display = 'block';
      res.innerHTML = `<img class="rand-r-img" src="${item.image || ''}" alt="" onerror="this.style.display='none'" loading="lazy"><div class="rand-r-title">${item.title || ''}</div><div style="font-size:.72rem;color:var(--t3);margin-bottom:6px">${item._cat} · ${item.type || ''}</div><div class="rand-r-desc">${(item.description || 'Sem descrição.').slice(0, 150)}...</div><button class="mbtn mp" style="margin-top:10px;width:100%;justify-content:center" onclick="openDetail(${item.id},'${item._cat}');closeOv('rand-ov')"><i class="fas fa-play" aria-hidden="true"></i> Ver detalhes</button>`;
    }
    toast(`🎲 ${item.title}!`, 'success');
  });
}
['rand-btn','rand-x'].forEach(id => {
  const el = document.getElementById(id);
  if(el){
    if(id === 'rand-btn') el.addEventListener('click', () => openOv('rand-ov'));
    if(id === 'rand-x') el.addEventListener('click', () => closeOv('rand-ov'));
  }
});

// ═══════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════
function openAdmin(){ openOv('adm-ov'); loadAdminList(); updateJsonEd(); }
const admBtn = document.getElementById('adm-btn');
if(admBtn) admBtn.addEventListener('click', openAdmin);

document.querySelectorAll('.adm-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.adm-tab').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-selected', 'false'); });
    document.querySelectorAll('.adm-sec').forEach(s => s.classList.remove('on'));
    btn.classList.add('on');
    btn.setAttribute('aria-selected', 'true');
    const sec = document.getElementById('adm-' + btn.dataset.atab);
    if(sec) sec.classList.add('on');
    if(btn.dataset.atab === 'json') updateJsonEd();
    if(btn.dataset.atab === 'list') loadAdminList();
  });
});

const fCat = document.getElementById('f-cat');
if(fCat) fCat.addEventListener('change', toggleCatFields);
function toggleCatFields(){
  const cat = fCat ? fCat.value : 'anime';
  ['anim','mang','game','news'].forEach(k => {
    const el = document.getElementById(k + '-fields');
    if(el) el.style.display = 'none';
  });
  if(cat === 'anime'){ const el = document.getElementById('anim-fields'); if(el) el.style.display = 'block'; }
  else if(cat === 'manga'){ const el = document.getElementById('mang-fields'); if(el) el.style.display = 'block'; }
  else if(cat === 'games'){ const el = document.getElementById('game-fields'); if(el) el.style.display = 'block'; }
  else if(cat === 'news'){ const el = document.getElementById('news-fields'); if(el) el.style.display = 'block'; }
}

let seasForms = [];
const addSeaBtn = document.getElementById('add-sea-btn');
if(addSeaBtn) addSeaBtn.addEventListener('click', () => { seasForms.push({number: seasForms.length + 1, episodes: []}); renderSeasForms(); });
function renderSeasForms(){
  const ct = document.getElementById('seas-container');
  if(!ct) return;
  ct.innerHTML = '';
  seasForms.forEach((s, si) => {
    const div = document.createElement('div'); div.className = 'sea-form-item';
    div.innerHTML = `<div class="sea-form-hdr"><strong style="font-size:.85rem;color:var(--c)">Temporada ${s.number}</strong><button class="del-btn" onclick="removeSea(${si})" aria-label="Remover temporada"><i class="fas fa-times" aria-hidden="true"></i></button></div><div id="eps-ct-${si}"></div><button class="adm-sec-btn" onclick="addEpForm(${si})" style="margin-top:6px;font-size:.74rem"><i class="fas fa-plus" aria-hidden="true"></i> Episódio</button>`;
    ct.appendChild(div);
    renderEpForms(si);
  });
}
function removeSea(si){ seasForms.splice(si, 1); renderSeasForms(); }
function addEpForm(si){ seasForms[si].episodes.push({number: seasForms[si].episodes.length + 1, name: '', duration: '24min', videoUrl: ''}); renderEpForms(si); }
function renderEpForms(si){
  const ct = document.getElementById(`eps-ct-${si}`);
  if(!ct) return;
  ct.innerHTML = '';
  seasForms[si].episodes.forEach((ep, ei) => {
    const row = document.createElement('div'); row.className = 'ep-form-row';
    row.innerHTML = `<input class="finp" type="number" value="${ep.number}" onchange="seasForms[${si}].episodes[${ei}].number=+this.value" style="text-align:center" aria-label="Número"><input class="finp" placeholder="Nome" value="${ep.name}" onchange="seasForms[${si}].episodes[${ei}].name=this.value" aria-label="Nome"><input class="finp" placeholder="Duração" value="${ep.duration}" onchange="seasForms[${si}].episodes[${ei}].duration=this.value" aria-label="Duração"><button class="del-btn" onclick="seasForms[${si}].episodes.splice(${ei},1);renderEpForms(${si})" aria-label="Remover"><i class="fas fa-times" aria-hidden="true"></i></button>`;
    ct.appendChild(row);
    const urlRow = document.createElement('div'); urlRow.style.cssText = 'grid-column:1/-1;margin-bottom:4px';
    urlRow.innerHTML = `<input class="finp" placeholder="URL do vídeo" value="${ep.videoUrl || ''}" onchange="seasForms[${si}].episodes[${ei}].videoUrl=this.value" style="font-size:.76rem" aria-label="URL">`;
    ct.appendChild(urlRow);
  });
}

const admSaveBtn = document.getElementById('adm-save-btn');
if(admSaveBtn) admSaveBtn.addEventListener('click', saveAdminItem);
function saveAdminItem(){
  const catEl = document.getElementById('f-cat');
  const cat = catEl ? catEl.value : 'anime';
  const titleEl = document.getElementById('f-title');
  const title = titleEl ? titleEl.value.trim() : '';
  if(!title){ toast('Título é obrigatório!', 'error'); return; }
  const item = {
    id: STATE.editId || itemId++,
    title,
    image: (document.getElementById('f-img') || {}).value?.trim() || '',
    releaseDate: (document.getElementById('f-date') || {}).value || new Date().toISOString().split('T')[0],
    ageRating: (document.getElementById('f-age') || {}).value || 'L',
    type: (document.getElementById('f-type') || {}).value?.trim() || '',
    description: (document.getElementById('f-desc') || {}).value?.trim() || '',
    video: (document.getElementById('f-video') || {}).value?.trim() || '',
    rating: parseFloat((document.getElementById('f-rating') || {}).value) || null,
    externalUrl: (document.getElementById('f-ext') || {}).value?.trim() || '',
    isNew: (document.getElementById('f-isnew') || {}).checked || false
  };
  if(cat === 'anime') item.seasons = JSON.parse(JSON.stringify(seasForms));
  else if(cat === 'manga'){ item.chapters = parseInt((document.getElementById('f-chaps') || {}).value) || 0; item.status = (document.getElementById('f-mstatus') || {}).value || 'Em andamento'; }
  else if(cat === 'games'){ item.platform = (document.getElementById('f-platform') || {}).value?.trim() || ''; item.developer = (document.getElementById('f-dev') || {}).value?.trim() || ''; }
  else if(cat === 'news'){ item.author = (document.getElementById('f-author') || {}).value?.trim() || ''; item.newsContent = (document.getElementById('f-ncontent') || {}).value?.trim() || ''; }

  if(STATE.editId){
    const arr = DB[STATE.editCat || cat];
    const idx = arr.findIndex(it => it.id === STATE.editId);
    if(idx !== -1) arr[idx] = item; else arr.push(item);
    STATE.editId = null; STATE.editCat = null;
    const lbl = document.getElementById('adm-save-lbl');
    if(lbl) lbl.textContent = 'Salvar Item';
    const cancel = document.getElementById('adm-cancel-btn');
    if(cancel) cancel.style.display = 'none';
    toast('Item atualizado!', 'success', '✏️');
  } else {
    if(!DB[cat]) DB[cat] = [];
    DB[cat].unshift(item);
    toast(`${title} adicionado!`, 'success', '✅');
    addNotif('✨', 'Novo conteúdo adicionado', `"${title}" foi adicionado à coleção.`, 'ni-g');
  }
  saveData(); renderCards(); updateStats(); resetAdminForm(); updateJsonEd(); loadAdminList();
}

function openAdminEdit(id, cat){
  closeOv('det-ov');
  const item = (DB[cat] || []).find(it => it.id === id);
  if(!item) return;
  STATE.editId = id; STATE.editCat = cat;
  const catEl = document.getElementById('f-cat');
  if(catEl) catEl.value = cat;
  toggleCatFields();
  const ft = document.getElementById('f-title'); if(ft) ft.value = item.title || '';
  const fi = document.getElementById('f-img'); if(fi) fi.value = item.image || '';
  const fd = document.getElementById('f-date'); if(fd) fd.value = item.releaseDate || '';
  const fa = document.getElementById('f-age'); if(fa) fa.value = item.ageRating || 'L';
  const fty = document.getElementById('f-type'); if(fty) fty.value = item.type || '';
  const fde = document.getElementById('f-desc'); if(fde) fde.value = item.description || '';
  const fv = document.getElementById('f-video'); if(fv) fv.value = item.video || '';
  const fr = document.getElementById('f-rating'); if(fr) fr.value = item.rating || '';
  const fe = document.getElementById('f-ext'); if(fe) fe.value = item.externalUrl || '';
  const fn = document.getElementById('f-isnew'); if(fn) fn.checked = !!item.isNew;
  if(cat === 'anime' && item.seasons){ seasForms = JSON.parse(JSON.stringify(item.seasons)); renderSeasForms(); }
  if(cat === 'manga'){ const fc = document.getElementById('f-chaps'); if(fc) fc.value = item.chapters || ''; const fm = document.getElementById('f-mstatus'); if(fm) fm.value = item.status || 'Em andamento'; }
  if(cat === 'games'){ const fp = document.getElementById('f-platform'); if(fp) fp.value = item.platform || ''; const fd = document.getElementById('f-dev'); if(fd) fd.value = item.developer || ''; }
  if(cat === 'news'){ const fau = document.getElementById('f-author'); if(fau) fau.value = item.author || ''; const fn2 = document.getElementById('f-ncontent'); if(fn2) fn2.value = item.newsContent || ''; }
  const lbl = document.getElementById('adm-save-lbl');
  if(lbl) lbl.textContent = 'Atualizar Item';
  const cancel = document.getElementById('adm-cancel-btn');
  if(cancel) cancel.style.display = 'flex';
  document.querySelectorAll('.adm-tab').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-selected', 'false'); });
  document.querySelectorAll('.adm-sec').forEach(s => s.classList.remove('on'));
  const addTab = document.querySelector('[data-atab="add"]');
  if(addTab){ addTab.classList.add('on'); addTab.setAttribute('aria-selected', 'true'); }
  document.getElementById('adm-add').classList.add('on');
  openAdmin();
}

const cancelBtn = document.getElementById('adm-cancel-btn');
if(cancelBtn){
  cancelBtn.addEventListener('click', () => {
    STATE.editId = null; STATE.editCat = null;
    const lbl = document.getElementById('adm-save-lbl');
    if(lbl) lbl.textContent = 'Salvar Item';
    cancelBtn.style.display = 'none';
    resetAdminForm();
  });
}

function resetAdminForm(){
  ['f-title','f-img','f-type','f-desc','f-video','f-rating','f-ext'].forEach(id => {
    const el = document.getElementById(id);
    if(el) el.value = '';
  });
  const fd = document.getElementById('f-date');
  if(fd) fd.value = new Date().toISOString().split('T')[0];
  const fa = document.getElementById('f-age');
  if(fa) fa.value = 'L';
  const fn = document.getElementById('f-isnew');
  if(fn) fn.checked = false;
  seasForms = [];
  const sc = document.getElementById('seas-container');
  if(sc) sc.innerHTML = '';
  const fc = document.getElementById('f-chaps');
  if(fc) fc.value = '';
  const fn2 = document.getElementById('f-ncontent');
  if(fn2) fn2.value = '';
  const fau = document.getElementById('f-author');
  if(fau) fau.value = '';
  const fp = document.getElementById('f-platform');
  if(fp) fp.value = '';
  const fd2 = document.getElementById('f-dev');
  if(fd2) fd2.value = '';
  toggleCatFields();
}

function loadAdminList(){
  const ct = document.getElementById('adm-list-ct');
  if(!ct) return;
  ct.innerHTML = '';
  ['anime','manga','games','news'].forEach(cat => {
    (DB[cat] || []).forEach(item => {
      const div = document.createElement('div');
      div.style.cssText = 'display:flex;gap:10px;align-items:center;padding:10px;border:1px solid var(--bd);border-radius:var(--rsm);margin-bottom:7px;background:rgba(255,255,255,.02)';
      div.innerHTML = `<img src="${item.image || ''}" style="width:36px;height:50px;object-fit:cover;border-radius:4px" alt="" onerror="this.style.display='none'" loading="lazy"><div style="flex:1;min-width:0"><div style="font-family:Rajdhani;font-size:.89rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.title || ''}</div><div style="font-size:.7rem;color:var(--t3)">${cat} · ID ${item.id}</div></div><button class="adm-sec-btn" onclick="openAdminEdit(${item.id},'${cat}')" aria-label="Editar ${item.title || ''}"><i class="fas fa-pen" aria-hidden="true"></i></button><button class="del-btn" onclick="deleteItem(${item.id},'${cat}');loadAdminList()" aria-label="Deletar ${item.title || ''}"><i class="fas fa-times" aria-hidden="true"></i></button>`;
      ct.appendChild(div);
    });
  });
  if(!ct.children.length) ct.innerHTML = '<div style="text-align:center;color:var(--t3);padding:30px;font-size:.84rem">Nenhum conteúdo ainda</div>';
}

function updateJsonEd(){ const je = document.getElementById('json-ed'); if(je) je.value = JSON.stringify(DB, null, 2); }
const jsonSaveBtn = document.getElementById('json-save-btn');
if(jsonSaveBtn){
  jsonSaveBtn.addEventListener('click', () => {
    try{ const d = JSON.parse(document.getElementById('json-ed').value); Object.assign(DB, d); saveData(); renderCards(); updateStats(); toast('JSON salvo!', 'success'); }
    catch(e){ toast('JSON inválido: ' + e.message, 'error'); }
  });
}
const jsonLoadBtn = document.getElementById('json-load-btn');
if(jsonLoadBtn) jsonLoadBtn.addEventListener('click', () => { updateJsonEd(); toast('JSON carregado', 'info'); });
const jsonExportBtn = document.getElementById('json-export-btn');
if(jsonExportBtn){
  jsonExportBtn.addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(DB, null, 2));
    a.download = 'hubotaku-data.json'; a.click(); toast('Exportado!', 'success');
  });
}
const jsonImportFile = document.getElementById('json-import-file');
if(jsonImportFile){
  jsonImportFile.addEventListener('change', e => {
    const f = e.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try{ const d = JSON.parse(ev.target.result); Object.assign(DB, d); saveData(); renderCards(); updateStats(); toast('Importado!', 'success'); }
      catch(er){ toast('Erro: ' + er.message, 'error'); }
    };
    r.readAsText(f); e.target.value = '';
  });
}
const clearAllBtn = document.getElementById('clear-all-btn');
if(clearAllBtn){
  clearAllBtn.addEventListener('click', () => {
    if(!confirm('Limpar TODO o conteúdo? Esta ação não pode ser desfeita!')) return;
    DB.anime = []; DB.manga = []; DB.games = []; DB.news = []; itemId = 1; saveData(); renderCards(); updateStats(); toast('Conteúdo apagado', 'warning');
  });
}

const admAcc = document.getElementById('adm-acc');
if(admAcc){
  admAcc.addEventListener('change', function(){
    document.body.dataset.accent = this.value;
    localStorage.setItem('ho_accent', this.value);
    toast('Cor alterada!', 'success', '🎨');
  });
}

// ═══════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════
function initTheme(){
  const t = localStorage.getItem('ho_theme');
  if(t === 'light'){ document.body.classList.add('lm'); const btn = document.getElementById('theme-btn'); if(btn) btn.innerHTML = '<i class="fas fa-sun" aria-hidden="true"></i>'; }
  const acc = localStorage.getItem('ho_accent');
  if(acc){ document.body.dataset.accent = acc; const sel = document.getElementById('adm-acc'); if(sel) sel.value = acc; }
}
const themeBtn = document.getElementById('theme-btn');
if(themeBtn){
  themeBtn.addEventListener('click', () => {
    const lm = document.body.classList.toggle('lm');
    themeBtn.innerHTML = lm ? '<i class="fas fa-sun" aria-hidden="true"></i>' : '<i class="fas fa-moon" aria-hidden="true"></i>';
    localStorage.setItem('ho_theme', lm ? 'light' : 'dark');
    toast(lm ? 'Tema claro' : 'Tema escuro', 'info', lm ? '☀️' : '🌙');
  });
}

// ═══════════════════════════════════════════
//  SEARCH & FILTERS
// ═══════════════════════════════════════════
let srchT;
const srchInput = document.getElementById('srch');
if(srchInput){
  srchInput.addEventListener('input', e => {
    clearTimeout(srchT);
    srchT = setTimeout(() => { STATE.search = e.target.value; STATE.page = 1; renderCards(); }, 200);
  });
}

const sortSel = document.getElementById('sort-sel');
if(sortSel) sortSel.addEventListener('change', e => { STATE.sort = e.target.value; STATE.page = 1; renderCards(); });
const typeSel = document.getElementById('type-sel');
if(typeSel) typeSel.addEventListener('change', e => { STATE.type = e.target.value; STATE.page = 1; renderCards(); });
const ageSel = document.getElementById('age-sel');
if(ageSel) ageSel.addEventListener('change', e => { STATE.age = e.target.value; STATE.page = 1; renderCards(); });
const limitSel = document.getElementById('limit-sel');
if(limitSel) limitSel.addEventListener('change', e => { STATE.perPage = parseInt(e.target.value); STATE.page = 1; renderCards(); });

const vgrid = document.getElementById('vgrid');
const vlist = document.getElementById('vlist');
if(vgrid){
  vgrid.addEventListener('click', () => {
    STATE.view = 'grid';
    const cg = document.getElementById('cgrid');
    if(cg) cg.classList.remove('list-view');
    vgrid.classList.add('on'); vgrid.setAttribute('aria-pressed', 'true');
    if(vlist){ vlist.classList.remove('on'); vlist.setAttribute('aria-pressed', 'false'); }
  });
}
if(vlist){
  vlist.addEventListener('click', () => {
    STATE.view = 'list';
    const cg = document.getElementById('cgrid');
    if(cg) cg.classList.add('list-view');
    vlist.classList.add('on'); vlist.setAttribute('aria-pressed', 'true');
    if(vgrid){ vgrid.classList.remove('on'); vgrid.setAttribute('aria-pressed', 'false'); }
  });
}

const navTabs = document.getElementById('nav-tabs');
if(navTabs){
  navTabs.addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if(!btn) return;
    document.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
    btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
    STATE.tab = btn.dataset.tab; STATE.page = 1; STATE.type = 'all'; STATE.age = 'all'; STATE.search = '';
    if(srchInput) srchInput.value = '';
    updateTypeFilter();
    renderCards();
    scrollToMain();
  });
}

function updateTypeFilter(){
  const sel = document.getElementById('type-sel');
  if(!sel) return;
  const opts = typeOptsByTab[STATE.tab] || ['all'];
  sel.innerHTML = opts.map(o => `<option value="${o}">${o === 'all' ? 'Todos os tipos' : o}</option>`).join('');
}

// Footer links
document.querySelectorAll('[data-tab]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = a.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => { b.classList.toggle('active', b.dataset.tab === t); b.setAttribute('aria-selected', b.dataset.tab === t); });
    STATE.tab = t; STATE.page = 1; updateTypeFilter(); renderCards(); scrollToMain();
  });
});
const footAi = document.getElementById('foot-ai');
if(footAi) footAi.addEventListener('click', e => { e.preventDefault(); openOv('ai-ov'); });
const footWl = document.getElementById('foot-wl');
if(footWl) footWl.addEventListener('click', e => { e.preventDefault(); renderWatchlist(); openOv('wl-ov'); });
const footRand = document.getElementById('foot-rand');
if(footRand) footRand.addEventListener('click', e => { e.preventDefault(); openOv('rand-ov'); });

const aiOpenBtn = document.getElementById('ai-open-btn');
if(aiOpenBtn) aiOpenBtn.addEventListener('click', () => openOv('ai-ov'));
const heroAiBtn = document.getElementById('hero-ai-btn');
if(heroAiBtn) heroAiBtn.addEventListener('click', () => openOv('ai-ov'));
const wlBtn = document.getElementById('wl-btn');
if(wlBtn) wlBtn.addEventListener('click', () => { renderWatchlist(); openOv('wl-ov'); });
const wlClear = document.getElementById('wl-clear');
if(wlClear){
  wlClear.addEventListener('click', () => {
    if(confirm('Limpar watchlist?')){ watchlist = []; saveWL(); renderWatchlist(); toast('Watchlist limpa', 'info'); }
  });
}
const notifBtn = document.getElementById('notif-btn');
if(notifBtn) notifBtn.addEventListener('click', () => { renderNotifs(); openOv('notif-ov'); });
const markRead = document.getElementById('mark-read');
if(markRead){
  markRead.addEventListener('click', () => {
    notifications.forEach(n => n.unread = false); saveNotifs(); updateNotifDot(); renderNotifs(); toast('Notificações marcadas como lidas', 'success');
  });
}
const logoLink = document.getElementById('logo-link');
if(logoLink) logoLink.addEventListener('click', e => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); });

function scrollToMain(){ window.scrollTo({top: document.getElementById('main-anchor').offsetTop - 80, behavior: 'smooth'}); }

// ═══════════════════════════════════════════
//  AI SAKURA — Sistema Híbrido (Local + API)
// ═══════════════════════════════════════════
const aiBody = document.getElementById('ai-body');

const sakuraKnowledge = {
  'recomende um anime': `Claro! Aqui vão recomendações do nosso catálogo:

🎯 **Iniciantes**: Demon Slayer, My Hero Academia, Spy x Family
🧠 **Pensar**: Steins;Gate, Death Note, Monster
😂 **Rir**: Spy x Family, One Piece
💔 **Chorar**: Demon Slayer

Temos ${DB.anime.length} animes! Queres algo específico?`,
  'melhor mangá de ação': `Top 3 Ação no catálogo:

🏆 **Berserk** — 5.0★, 364 caps, obra-prima
🏆 **Vinland Saga** — 4.7★, vikings e vingança
🏆 **One Piece** — 4.9★, 1100+ caps

Queres saber mais sobre algum?`,
  'jogos de anime no ps5': `Jogos otaku no PS5:

🎮 **Persona 5 Royal** — 4.9★, JRPG perfeito
🎮 **Honkai: Star Rail** — 4.7★, RPG por turnos
🎮 **Elden Ring** — 4.8★, Souls-like
🎮 **Final Fantasy XVI** — 4.4★, combate épico

Todos têm trailer nos detalhes!`,
  'o que é isekai': `**Isekai** (異世界) = "outro mundo" em japonês.

O protagonista é transportado para outro mundo fantástico.

📌 **Exemplos**: Sword Art Online, Re:Zero, Mushoku Tensei

Filtra por tipo "Isekai" na aba Animes!`,
  'anime': `Temos ${DB.anime.length} animes! Top 5:

1. Fullmetal Alchemist (5.0★)
2. Attack on Titan (4.9★)
3. One Piece (4.8★)
4. Steins;Gate (4.9★)
5. Death Note (4.8★)

Usa os filtros para encontrar por género!`,
  'manga': `Temos ${DB.manga.length} mangás! Destaques:

📚 **Berserk** — 5.0★, 364 caps
📚 **One Piece** — 4.9★, 1100+ caps
📚 **Vagabond** — 4.9★, Miyamoto Musashi
📚 **Monster** — 4.8★, thriller psicológico

Queres recomendações por género?`,
  'jogo': `Temos ${DB.games.length} jogos!

🎮 **Genshin Impact** — 4.5★, mundo aberto
🎮 **Honkai: Star Rail** — 4.7★, RPG por turnos
🎮 **Persona 5 Royal** — 4.9★, JRPG definitivo
🎮 **Elden Ring** — 4.8★, Souls-like

Todos têm detalhes com trailer!`,
  'noticia': `Notícias recentes:

📰 Demon Slayer: Novo arco para 2026
📰 One Piece Live Action T2 confirmada
📰 Chainsaw Man Parte 2 em produção
📰 Solo Leveling T2 em julho

Todas na aba "Notícias"!`,
  'curiosidade': `Curiosidade otaku! 🎲

Sabias que:
• O manga mais longo é Kochikame com 201 volumes?
• Studio Ghibli recusa fazer sequências?
• O primeiro anime colorido foi de 1958?
• "Otaku" originalmente significava "sua casa"?

Queres mais?`,
  'temporada': `Temporada atual:

Animes em destaque:
• Demon Slayer (novo arco)
• Jujutsu Kaisen
• Chainsaw Man
• Solo Leveling

Fica atento às notícias!`,
  'ola': 'Olá! 🌸 Bem-vindo ao Hub Otaku! Sou a Sakura, tua assistente otaku. Como posso ajudar?',
  'oi': 'Oi! 🌸 Pronto para explorar o mundo otaku? Pergunta sobre animes, mangás, jogos ou curiosidades!',
  'obrigado': 'De nada! 🌸 É um prazer ajudar! Volta sempre que precisares.',
  'adeus': 'Adeus! 👋 Que tenhas um dia épico! Volta sempre ao Hub Otaku!',
  'tchau': 'Tchau! 🌸 Até à próxima aventura otaku!',
};

function findLocalResponse(text){
  const lower = text.toLowerCase().trim();
  for(const [key, value] of Object.entries(sakuraKnowledge)){
    if(lower.includes(key)) return value;
  }
  const allItems = [...(DB.anime||[]), ...(DB.manga||[]), ...(DB.games||[])];
  for(const item of allItems){
    if(item.title && lower.includes(item.title.toLowerCase().split(':')[0])){
      return `**${item.title}** — ${item.description || 'Sem descrição'}

⭐ Nota: ${item.rating || 'N/A'}/5
📅 ${item.releaseDate || 'N/A'}

Clica no card para ver todos os detalhes!`;
    }
  }
  return null;
}

function aiMsg(text, role='bot'){
  if(!aiBody) return;
  const div = document.createElement('div');
  div.className = `ai-msg ${role}`;
  div.innerHTML = `<div class="ai-bubble">${text}</div><div class="ai-time">${new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</div>`;
  aiBody.appendChild(div);
  aiBody.scrollTop = aiBody.scrollHeight;
  return div;
}
function aiThinking(){
  if(!aiBody) return;
  const div = document.createElement('div');
  div.className = 'ai-msg bot';
  div.innerHTML = `<div class="ai-bubble ai-thinking"><div class="ai-dot"></div><div class="ai-dot"></div><div class="ai-dot"></div></div>`;
  aiBody.appendChild(div);
  aiBody.scrollTop = aiBody.scrollHeight;
  return div;
}

async function sendAI(text){
  if(!text.trim()) return;
  aiMsg(text, 'usr');
  aiHistory.push({role:'user', content:text});
  const thinking = aiThinking();
  const inp = document.getElementById('ai-inp');
  const sendBtn = document.getElementById('ai-send');
  if(inp){ inp.disabled = true; inp.value = ''; }
  if(sendBtn) sendBtn.disabled = true;

  const localResponse = findLocalResponse(text);
  if(localResponse){
    setTimeout(() => {
      if(thinking) thinking.remove();
      aiHistory.push({role:'assistant', content: localResponse});
      aiMsg(localResponse.replace(/
/g, '<br>'), 'bot');
      if(inp){ inp.disabled = false; inp.focus(); }
      if(sendBtn) sendBtn.disabled = false;
    }, 800);
    return;
  }

  try{
    const res = await fetch('https://text.pollinations.ai/' + encodeURIComponent(
      `Você é Sakura, assistente otaku do Hub Otaku. Responda em português de forma simpática com emojis. Pergunta: ${text}`
    ) + '?seed=' + Math.random() + '&json=false');
    const reply = await res.text();
    if(thinking) thinking.remove();
    aiHistory.push({role:'assistant', content: reply});
    aiMsg(reply.replace(/
/g, '<br>'), 'bot');
  } catch(e){
    if(thinking) thinking.remove();
    aiMsg('Desculpa, não consegui conectar agora. 🌸 Mas podes explorar o catálogo ou perguntar sobre animes populares!', 'bot');
  }
  if(inp){ inp.disabled = false; inp.focus(); }
  if(sendBtn) sendBtn.disabled = false;
}

const aiSendBtn = document.getElementById('ai-send');
if(aiSendBtn) aiSendBtn.addEventListener('click', () => sendAI(document.getElementById('ai-inp').value));
const aiInp = document.getElementById('ai-inp');
if(aiInp){
  aiInp.addEventListener('keydown', e => { if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendAI(e.target.value); } });
}
document.querySelectorAll('.ai-sug').forEach(s => s.addEventListener('click', () => sendAI(s.textContent)));

function initAI(){
  aiMsg('Olá! Sou a Sakura 🌸, sua assistente otaku inteligente. Posso te ajudar a descobrir animes, recomendar mangás, tirar dúvidas sobre cultura japonesa e muito mais! Como posso te ajudar hoje?', 'bot');
}

// ═══════════════════════════════════════════
//  PWA
// ═══════════════════════════════════════════
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault(); deferredInstall = e;
  const ib = document.getElementById('install-btn');
  if(ib) ib.classList.remove('hidden');
  const fi = document.getElementById('foot-install');
  if(fi) fi.style.display = '';
});
const installBtn = document.getElementById('install-btn');
if(installBtn){
  installBtn.addEventListener('click', async () => {
    if(!deferredInstall) return;
    deferredInstall.prompt();
    const r = await deferredInstall.userChoice;
    if(r.outcome === 'accepted'){ toast('App instalado!', 'success', '📲'); addNotif('📲', 'App instalado', 'Hub Otaku foi instalado com sucesso.', 'ni-g'); }
    deferredInstall = null;
    installBtn.classList.add('hidden');
  });
}
const footInstall = document.getElementById('foot-install');
if(footInstall) footInstall.addEventListener('click', e => { e.preventDefault(); if(installBtn) installBtn.click(); });

// ═══════════════════════════════════════════
//  KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════
document.addEventListener('keydown', e => {
  if(e.key === 'Escape'){
    document.querySelectorAll('.ov.open').forEach(o => closeOv(o.id));
    document.querySelectorAll('.fpage.open').forEach(fp => fp.classList.remove('open'));
    document.body.style.overflow = '';
  }
  if((e.ctrlKey || e.metaKey) && e.key === 'k'){
    e.preventDefault();
    const srch = document.getElementById('srch');
    if(srch) srch.focus();
  }
});

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════
function init(){
  loadData();
  initTheme();
  updateTypeFilter();
  renderCards();
  updateStats();
  updateNotifDot();
  renderNotifs();
  initAI();
  toggleCatFields();
  const fd = document.getElementById('f-date');
  if(fd) fd.value = new Date().toISOString().split('T')[0];
  seasForms = [{number: 1, episodes: []}];
  renderSeasForms();

  // Fetch real data from Jikan API
  fetchJikanAnime();
  fetchJikanManga();

  if(!localStorage.getItem('ho_welcomed')){
    localStorage.setItem('ho_welcomed', '1');
    addNotif('👋', 'Bem-vindo ao Hub Otaku ∞', 'Explore a nova interface cyberpunk com IA Sakura integrada!', 'ni-p');
    setTimeout(() => toast('Bem-vindo ao Hub Otaku ∞ 🎌', 'success', '✨'), 800);
  }
}

document.addEventListener('DOMContentLoaded', init);
