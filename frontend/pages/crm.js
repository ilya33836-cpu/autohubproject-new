import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ru';
import 'react-big-calendar/lib/css/react-big-calendar.css';
moment.locale('ru');
const localizer = momentLocalizer(moment);
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export default function CRM(){
  const[auth,setAuth]=useState(false);const[load,setLoad]=useState(true);const[user,setUser]=useState(null);
  const[stats,setStats]=useState(null);const[rev,setRev]=useState(null);const[clients,setClients]=useState([]);
  const[orders,setOrders]=useState([]);const[err,setErr]=useState('');const[nav,setNav]=useState('Главная');
  const[col,setCol]=useState(false);const[sq,setSq]=useState('');const[nn,setNN]=useState(false);
  const[pm,setPM]=useState(false);const[so,setSO]=useState(null);
  const[sf,setSF]=useState('all');const[rp,setRP]=useState(30);
  const[notifications,setNotifications]=useState([]);
  const[unreadCount,setUnreadCount]=useState(0);
  const[showCreateOrder,setShowCreateOrder]=useState(false);
  const[createError,setCreateError]=useState('');

  // CRM session is validated once when the page mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
   useEffect(()=>{const t=localStorage.getItem('access_token');if(!t){setLoad(false);return}vt(t)},[]);
  const vt=async t=>{try{const r=await axios.get(API+'/auth/me',{headers:{Authorization:'Bearer '+t}});
    if(r.data.role==='admin'||r.data.role==='manager'){setUser(r.data);setAuth(true);fd(t)}else{localStorage.removeItem('access_token');setLoad(false)}}catch{localStorage.removeItem('access_token');setLoad(false)}};
  const fd=async t=>{const h={Authorization:'Bearer '+t};try{const[s,rd,cr,or,nf]=await Promise.all([
    axios.get(API+'/admin/stats/summary',{headers:h}),axios.get(API+'/admin/stats/revenue-by-day?days='+rp,{headers:h}),
    axios.get(API+'/users?limit=100',{headers:h}),axios.get(API+'/orders?limit=100',{headers:h}),
    axios.get(API+'/notifications/my?limit=50',{headers:h})]);
    setStats(s.data);setRev(rd.data);setClients(cr.data.filter(u=>u.role==='client'));setOrders(or.data);
    const mapped=(nf.data||[]).map(n=>({id:n.id,text:n.message,time:new Date(n.created_at).toLocaleString('ru-RU'),read:n.is_read,type:n.type||'general'}));
    setNotifications(mapped);setUnreadCount(mapped.filter(x=>!x.read).length)}catch{setErr('Ошибка загрузки')}finally{setLoad(false)}};
  const login=async e=>{e.preventDefault();setErr('');const f=new FormData(e.target);
    try{const r=await axios.post(API+'/auth/token',new URLSearchParams({grant_type:'password',username:f.get('username'),password:f.get('password')}),{headers:{'Content-Type':'application/x-www-form-urlencoded'}});
    const{access_token,role}=r.data;if(role!=='admin'&&role!=='manager'){setErr('Доступ запрещён');return}
    localStorage.setItem('access_token',access_token);setAuth(true);fd(access_token)}catch{setErr('Неверный логин или пароль')}};
  const logout=()=>{localStorage.removeItem('access_token');setAuth(false);setStats(null);setUser(null)};
  const fo=sf==='all'?orders:orders.filter(o=>o.status===sf);
  const fc=sq?clients.filter(c=>(c.full_name||'').toLowerCase().includes(sq.toLowerCase())||c.username.toLowerCase().includes(sq.toLowerCase())):clients;
  if(load)return<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',background:'#F8FAFC',fontFamily:'Inter',color:'#64748B'}}>Загрузка...</div>;
  if(!auth)return <LoginPage onLogin={login} err={err}/>;
  return<div style={{minHeight:'100vh',background:'#F8FAFC',display:'flex',fontFamily:'Inter,-apple-system,sans-serif'}}>
    <Head><title>AUTOHUB CRM</title></Head>
    <Sidebar n={nav} s={setNav} c={col} sc={setCol} lo={logout} unreadCount={unreadCount}/>
    <main style={{marginLeft:col?'70px':'240px',flex:1,padding:'24px 32px',transition:'margin-left .3s'}}>
      {nav!=='Календарь'&&<Header u={user} sq={sq} ss={setSq} nn={nn} sn={setNN} pm={pm} sp={setPM} lo={logout} notifications={notifications} clearNotifications={()=>{setNotifications([]);setUnreadCount(0)}} onOpenNotifications={()=>setNav('Уведомления')}/>}
      {nav==='Главная'&&stats&&<DashboardView stats={stats} rev={rev} rp={rp} sp={setRP} fo={fo} sf={sf} setSF={setSF} setNav={setNav}/>}
      {nav==='Клиенты'&&<ClientsView c={fc} sq={sq} ss={setSq}/>}
      {nav==='Сделки'&&<DealsView o={fo} sf={sf} ss={setSF} so={setSO} onCreateOrder={()=>setShowCreateOrder(true)}/>}
      {nav==='Календарь'&&<CalendarView orders={orders} clients={clients}/>}
      {nav==='Сообщения'&&<MessagesView clients={clients} orders={orders}/>}
      {nav==='Уведомления'&&<NotificationsView notifications={notifications} setNotifications={setNotifications} setUnreadCount={setUnreadCount} api={API} token={localStorage.getItem('access_token')}/>}
      {nav==='Аналитика'&&<AnalyticsView stats={stats} rev={rev} rp={rp} sp={setRP} orders={orders}/>}
    </main>
      {so&&<OrderModal o={so} c={()=>setSO(null)} onUpdate={(updated)=>{setOrders(prev=>prev.map(o=>o.id===updated.id?updated:o));setSO(updated);}}/>}
      {showCreateOrder&&<CreateOrderModal api={API} clients={clients} token={localStorage.getItem('access_token')} onClose={()=>setShowCreateOrder(false)} onCreated={(order)=>{setOrders(prev=>[order,...prev]);setShowCreateOrder(false);}}/>}
  </div>}

function LoginPage({onLogin,err}){
  return<div style={{minHeight:'100vh',background:'#F8FAFC',display:'flex',justifyContent:'center',alignItems:'center',fontFamily:'Inter'}}>
    <Head><title>CRM - Login</title></Head>
    <div style={{background:'#FFF',padding:'48px',borderRadius:'16px',width:'100%',maxWidth:'400px',boxShadow:'0 4px 20px rgba(15,23,42,0.04)',border:'1px solid #E8ECF2'}}>
      <div style={{textAlign:'center',marginBottom:'32px'}}>
        <div style={{width:'48px',height:'48px',background:'linear-gradient(135deg,#4F63FF,#7C3AED)',borderRadius:'12px',margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center',color:'#FFF',fontSize:'20px',fontWeight:'700'}}>A</div>
        <h1 style={{fontSize:'24px',fontWeight:'700',color:'#0F172A',margin:0}}>AUTOHUB CRM</h1>
        <p style={{fontSize:'14px',color:'#64748B',marginTop:'8px'}}>Войдите в систему</p>
      </div>
      <form onSubmit={onLogin}>
        <input name="username"type="text"required placeholder="Логин"style={{width:'100%',padding:'12px 16px',borderRadius:'10px',border:'1px solid #E8ECF2',background:'#F8FAFC',fontSize:'14px',boxSizing:'border-box',outline:'none',marginBottom:'16px'}}/>
        <input name="password"type="password"required placeholder="Пароль"style={{width:'100%',padding:'12px 16px',borderRadius:'10px',border:'1px solid #E8ECF2',background:'#F8FAFC',fontSize:'14px',boxSizing:'border-box',outline:'none',marginBottom:'24px'}}/>
        {err&&<p style={{color:'#EF4444',marginBottom:'16px',fontSize:'14px'}}>{err}</p>}
        <button type="submit"style={{width:'100%',padding:'14px',borderRadius:'10px',border:'none',background:'#4F63FF',color:'#FFF',fontSize:'16px',cursor:'pointer',fontWeight:'600'}}>Войти</button>
      </form>
    </div>
  </div>}

function Sidebar({n,s,c,sc,lo,unreadCount}){
  const items=[['Главная','M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',0],
    ['Клиенты','M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',0],
    ['Сделки','M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',0],
    ['Календарь','M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',0],
    ['Сообщения','M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',0],
    ['Уведомления','M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',unreadCount],
    ['Аналитика','M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',0],
    ['На сайт','M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',0]];
  return<aside style={{width:c?'70px':'240px',background:'#0D1726',minHeight:'100vh',display:'flex',flexDirection:'column',position:'fixed',left:0,top:0,transition:'width .3s',overflow:'hidden',zIndex:1000}}>
    <div style={{padding:c?'24px 16px':'24px 20px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
        <div style={{width:'36px',height:'36px',background:'linear-gradient(135deg,#4F63FF,#7C3AED)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',color:'#FFF',fontWeight:'700',flexShrink:0}}>A</div>
        {!c&&<span style={{fontSize:'21px',fontWeight:'700',color:'#FFF'}}>CRM</span>}
      </div>
      {!c&&<p style={{fontSize:'12px',color:'#64748B',marginTop:'12px'}}>Администратор</p>}
    </div>
    <nav style={{flex:1,padding:'8px 12px'}}>
      {items.map(([name,icon,badge])=>(
        <button key={name}onClick={()=>{if(name==='На сайт'){window.location.href='/'}else{s(name)}}}title={name}style={{width:'100%',padding:'12px 16px',borderRadius:'10px',border:'none',background:n===name?'#4F63FF':'transparent',color:'#FFF',cursor:'pointer',fontSize:'14px',display:'flex',alignItems:'center',gap:'12px',marginBottom:'4px',fontWeight:'500',textAlign:'left',transition:'background .2s'}}
          onMouseEnter={(e)=>e.currentTarget.style.background=n===name?'#4F63FF':'rgba(255,255,255,0.1)'}
          onMouseLeave={(e)=>e.currentTarget.style.background=n===name?'#4F63FF':'transparent'}>
          <svg width="18"height="18"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="1.5"style={{flexShrink:0}}><path d={icon}/></svg>
          {!c&&<span style={{flex:1}}>{name}</span>}
          {!c&&badge>0&&<span style={{background:'#4F63FF',color:'#FFF',fontSize:'11px',fontWeight:'600',padding:'2px 7px',borderRadius:'10px'}}>{badge}</span>}
        </button>
      ))}
    </nav>
    <div style={{padding:'12px 16px',borderTop:'1px solid #1E293B'}}>
      <button onClick={()=>sc(!c)}style={{background:'transparent',border:'none',color:'#64748B',fontSize:'13px',cursor:'pointer',display:'flex',alignItems:'center',gap:'8px',padding:'8px 0',width:'100%'}}>
        <svg width="16"height="16"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"style={{transform:c?'rotate(180deg)':'none',transition:'transform .3s'}}><path d="M11 19l-7-7 7-7M18 19l-7-7 7-7"/></svg>
        {!c&&<span>Свернуть меню</span>}
      </button>
    </div>
  </aside>}

function Header({u,sq,ss,nn,sn,pm,sp,lo,notifications,clearNotifications,onOpenNotifications}){
  return<header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
    <div>
      <h1 style={{fontSize:'28px',fontWeight:'700',color:'#0F172A',margin:'0 0 6px'}}>Добро пожаловать, {u?.full_name||u?.username}! 👋</h1>
      <p style={{fontSize:'14px',color:'#64748B',margin:0}}>Вот что происходит с вашим бизнесом сегодня.</p>
    </div>
    <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
      <div style={{position:'relative'}}>
        <svg style={{position:'absolute',left:'14px',top:'50%',transform:'translateY(-50%)',color:'#94A3B8'}}width="16"height="16"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"><circle cx="11"cy="11"r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input placeholder="Поиск..."value={sq}onChange={(e)=>ss(e.target.value)}style={{width:'205px',padding:'10px 16px 10px 40px',borderRadius:'10px',border:'1px solid #E8ECF2',background:'#FFF',fontSize:'14px',outline:'none',fontFamily:'Inter'}}/>
      </div>
      <div style={{position:'relative'}}>
        <button onClick={()=>{sn(!nn);sp(false)}}style={{width:'40px',height:'40px',borderRadius:'10px',border:'1px solid #E8ECF2',background:'#FFF',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
          <svg width="18"height="18"viewBox="0 0 24 24"fill="none"stroke="#64748B"strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          {notifications.length>0&&<span style={{position:'absolute',top:'8px',right:'8px',width:'8px',height:'8px',background:'#EF4444',borderRadius:'50%'}}></span>}
        </button>
        {nn&&<NotificationPanel sn={sn} notifications={notifications} clearNotifications={()=>{setNotifications([]);setUnreadCount(0)}} onOpenNotifications={onOpenNotifications}/>}
      </div>
      <div style={{position:'relative'}}>
        <button onClick={()=>{sp(!pm);sn(false)}}style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',background:'none',border:'none',padding:0}}>
          <div style={{width:'38px',height:'38px',borderRadius:'10px',background:'linear-gradient(135deg,#4F63FF,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',color:'#FFF',fontWeight:'600',fontSize:'14px'}}>{(u?.full_name||u?.username||'A')[0].toUpperCase()}</div>
          <div style={{textAlign:'left'}}>
            <div style={{fontSize:'14px',fontWeight:'600',color:'#0F172A'}}>{u?.full_name||u?.username}</div>
            <div style={{fontSize:'12px',color:'#64748B'}}>Администратор</div>
          </div>
          <svg width="14"height="14"viewBox="0 0 24 24"fill="none"stroke="#64748B"strokeWidth="2"style={{transform:pm?'rotate(180deg)':'none',transition:'transform .2s'}}><path d="M6 9l6 6 6-6"/></svg>
        </button>
        {pm&&<ProfilePanel u={u} lo={lo} sp={sp}/>}
      </div>
    </div>
  </header>}

function NotificationPanel({sn,notifications,clearNotifications,onOpenNotifications}){
  return<div style={{position:'absolute',top:'48px',right:0,width:'300px',background:'#FFF',borderRadius:'12px',boxShadow:'0 8px 30px rgba(15,23,42,.12)',border:'1px solid #E8ECF2',zIndex:100}}>
    <div style={{padding:'14px 16px',borderBottom:'1px solid #E8ECF2',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <h4 style={{fontSize:'14px',fontWeight:'600',color:'#0F172A',margin:0}}>Уведомления</h4>
      {notifications.length>0&&<button onClick={clearNotifications}style={{background:'none',border:'none',color:'#64748B',fontSize:'12px',cursor:'pointer'}}>Очистить все</button>}
    </div>
    {notifications.length===0 ? (
      <div style={{padding:'24px 16px',textAlign:'center'}}>
        <p style={{fontSize:'13px',color:'#94A3B8',margin:0}}>Нет уведомлений</p>
      </div>
    ) : (
      notifications.map((n)=>(
        <div key={n.id}style={{padding:'12px 16px',borderBottom:'1px solid #F1F5F9',cursor:'pointer',transition:'background .15s'}}onClick={()=>{sn(false);onOpenNotifications&&onOpenNotifications()}}
          onMouseEnter={(e)=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
          <p style={{fontSize:'13px',color:'#0F172A',margin:0}}>{n.text}</p>
          <p style={{fontSize:'11px',color:'#94A3B8',marginTop:'4px'}}>{n.time}</p>
        </div>
      ))
    )}
    <div style={{padding:'12px 16px',textAlign:'center'}}><button onClick={()=>{sn(false);onOpenNotifications&&onOpenNotifications()}}style={{background:'none',border:'none',color:'#4F63FF',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>Показать все</button></div>
  </div>}

function ProfilePanel({u,lo,sp}){
  return<div style={{position:'absolute',top:'56px',right:0,width:'200px',background:'#FFF',borderRadius:'12px',boxShadow:'0 8px 30px rgba(15,23,42,.12)',border:'1px solid #E8ECF2',zIndex:100}}>
    <div style={{padding:'12px 16px',borderBottom:'1px solid #E8ECF2'}}>
      <p style={{fontSize:'14px',fontWeight:'600',color:'#0F172A',margin:0}}>{u?.full_name||u?.username}</p>
      <p style={{fontSize:'12px',color:'#64748B',margin:'2px 0 0'}}>{u?.email||'admin@autohub.ru'}</p>
    </div>
    <div style={{padding:'8px'}}>
      {[{n:'Профиль',a:()=>alert('Настройки профиля')},{n:'Настройки',a:()=>alert('Страница настроек')},{n:'Выйти',a:lo}].map(item=>(
        <button key={item.n}onClick={()=>{item.a();sp(false)}}style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'none',background:'transparent',color:item.n==='Выйти'?'#EF4444':'#0F172A',fontSize:'14px',cursor:'pointer',textAlign:'left',transition:'background .15s'}}
          onMouseEnter={(e)=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>{item.n}</button>
      ))}
    </div>
  </div>}

function DashboardView({stats,rev,rp,sp,fo,sf,setSF,setNav}){
  return<>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px'}}>
      <Kpi t="Всего клиентов"v={stats.clients_count} c="+12.5%" ic="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" cl="#4F63FF" onClick={()=>setNav('Клиенты')}/>
      <Kpi t="Активные сделки"v={stats.cars_in_work_count} c="+8.2%" ic="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" cl="#F59E0B" onClick={()=>setNav('Сделки')}/>
      <Kpi t="Общий доход"v={stats.total_revenue?stats.total_revenue.toLocaleString('ru-RU')+' ₽':'0 ₽'} c="+23.1%" ic="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" cl="#10B981"/>
      <Kpi t="Новые заявки"v={stats.new_appointments_count} c="+5.3%" ic="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" cl="#8B5CF6"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:'20px',marginBottom:'24px'}}>
      <RevChart d={rev} p={rp} sp={sp}/>
      <DealsDist s={stats}/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'3fr',gap:'20px'}}>
      <OrdersTable o={fo} sf={sf} setSF={setSF} va={()=>setNav('Сделки')}/>
    </div>
  </>}

function Kpi({t,v,c,ic,cl,onClick}){
  const[h,setH]=useState(false);
  return<div onClick={onClick}style={{background:'#FFF',borderRadius:'14px',padding:'20px',border:'1px solid #E8ECF2',boxShadow:h?'0 8px 30px rgba(15,23,42,0.08)':'0 4px 20px rgba(15,23,42,0.04)',cursor:'pointer',transition:'all .2s',transform:h?'translateY(-2px)':'none'}}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>
    <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
      <div style={{width:'40px',height:'40px',borderRadius:'10px',background:cl+'15',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <svg width="20"height="20"viewBox="0 0 24 24"fill="none"stroke={cl}strokeWidth="2"><path d={ic}/></svg>
      </div>
      <span style={{fontSize:'14px',color:'#64748B',fontWeight:'500'}}>{t}</span>
    </div>
    <div style={{fontSize:'26px',fontWeight:'700',color:'#0F172A',marginBottom:'6px'}}>{v}</div>
    <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
      <span style={{fontSize:'13px',fontWeight:'600',color:'#10B981'}}>{c}</span>
      <span style={{fontSize:'12px',color:'#94A3B8'}}>по сравнению с прошлым месяцем</span>
    </div>
  </div>}

function RevChart({d,p,sp}){
  const m=d?.values?.length?Math.max(...d.values):1;
  return<div style={{background:'#FFF',borderRadius:'14px',padding:'24px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
      <h3 style={{fontSize:'16px',fontWeight:'600',color:'#0F172A',margin:0}}>Динамика доходов</h3>
      <select value={p}onChange={(e)=>sp(Number(e.target.value))}style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',fontSize:'13px',color:'#64748B',fontFamily:'Inter',cursor:'pointer'}}>
        <option value={7}>7 дней</option><option value={30}>30 дней</option><option value={90}>90 дней</option>
      </select>
    </div>
    <div style={{height:'200px',display:'flex',alignItems:'flex-end',gap:'8px'}}>
      {d?.values?.length?d.values.map((v,i)=>(
        <div key={i}style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center'}}>
          <div style={{width:'100%',height:(v/m)*160+'px',background:'linear-gradient(180deg,#4F63FF 0%,rgba(79,99,255,0.2) 100%)',borderRadius:'6px 6px 0 0',transition:'height .3s'}}></div>
          <span style={{fontSize:'10px',color:'#94A3B8',marginTop:'8px'}}>{d.labels[i]?.slice(5)}</span>
        </div>
      )):<div style={{display:'flex',alignItems:'center',justifyContent:'center',width:'100%',color:'#94A3B8',fontSize:'14px'}}>Нет данных</div>}
    </div>
  </div>}

function DealsDist({s}){
  const t=(s?.completed_orders_count||0)+(s?.cars_in_work_count||0)+(s?.new_appointments_count||0);
  return<div style={{background:'#FFF',borderRadius:'14px',padding:'24px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
    <h3 style={{fontSize:'16px',fontWeight:'600',color:'#0F172A',margin:'0 0 24px'}}>Распределение сделок</h3>
    <div style={{textAlign:'center',marginBottom:'20px'}}>
      <div style={{width:'100px',height:'100px',borderRadius:'50%',background:'conic-gradient(#4F63FF 0% 33%,#F59E0B 33% 66%,#10B981 66% 100%)',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{width:'60px',height:'60px',borderRadius:'50%',background:'#FFF',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
          <span style={{fontSize:'20px',fontWeight:'700',color:'#0F172A'}}>{t}</span>
          <span style={{fontSize:'10px',color:'#64748B'}}>Всего</span>
        </div>
      </div>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
      <Leg cl="#4F63FF" l="Новые" v={s?.new_appointments_count||0}/>
      <Leg cl="#F59E0B" l="В работе" v={s?.cars_in_work_count||0}/>
      <Leg cl="#10B981" l="Завершены" v={s?.completed_orders_count||0}/>
    </div>
  </div>}

function Leg({cl,l,v}){return<div style={{display:'flex',alignItems:'center',gap:'10px'}}><div style={{width:'10px',height:'10px',borderRadius:'3px',background:cl}}></div><span style={{fontSize:'13px',color:'#64748B',flex:1}}>{l}</span><span style={{fontSize:'13px',fontWeight:'600',color:'#0F172A'}}>{v}</span></div>}

function OrdersTable({o,sf,setSF,va}){
  return<div style={{background:'#FFF',borderRadius:'14px',padding:'24px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
      <h3 style={{fontSize:'16px',fontWeight:'600',color:'#0F172A',margin:0}}>Последние сделки</h3>
      <div style={{display:'flex',gap:'8px'}}>
        <select value={sf}onChange={(e)=>setSF(e.target.value)}style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #E8ECF2',fontSize:'12px',color:'#64748B',fontFamily:'Inter',cursor:'pointer'}}>
          <option value="all">Все</option><option value="new">Новые</option><option value="in_progress">В работе</option><option value="completed">Завершены</option>
        </select>
        <button onClick={va}style={{background:'none',border:'none',color:'#4F63FF',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>Все сделки →</button>
      </div>
    </div>
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr style={{borderBottom:'1px solid #E8ECF2'}}>
        <th style={{padding:'12px 0',textAlign:'left',fontSize:'12px',fontWeight:'600',color:'#64748B',textTransform:'uppercase'}}>Клиент</th>
        <th style={{padding:'12px 0',textAlign:'left',fontSize:'12px',fontWeight:'600',color:'#64748B',textTransform:'uppercase'}}>Статус</th>
        <th style={{padding:'12px 0',textAlign:'right',fontSize:'12px',fontWeight:'600',color:'#64748B',textTransform:'uppercase'}}>Сумма</th>
      </tr></thead>
      <tbody>{o.slice(0,5).map(order=>(
        <tr key={order.id}style={{borderBottom:'1px solid #F1F5F9',cursor:'pointer',transition:'background .15s'}}onMouseEnter={(e)=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
          <td style={{padding:'14px 0',fontSize:'14px',color:'#0F172A'}}>{order.user_id}</td>
          <td style={{padding:'14px 0'}}><StatusPill s={order.status}/></td>
          <td style={{padding:'14px 0',textAlign:'right',fontSize:'14px',fontWeight:'600',color:'#0F172A'}}>{order.total_cost?order.total_cost.toLocaleString()+' ₽':'—'}</td>
        </tr>
      ))}</tbody>
    </table>
    <p style={{fontSize:'12px',color:'#94A3B8',marginTop:'16px',marginBottom:0}}>Показано {Math.min(5,o.length)} из {o.length} сделок</p>
  </div>}

function StatusPill({s}){
  const st={new:{bg:'#DBEAFE',c:'#1D4ED8',t:'Новый'},accepted:{bg:'#FEF3C7',c:'#B45309',t:'Принят'},in_progress:{bg:'#EDE9FE',c:'#6D28D9',t:'В работе'},completed:{bg:'#D1FAE5',c:'#047857',t:'Завершён'},cancelled:{bg:'#FEE2E2',c:'#B91C1C',t:'Отменён'}}[s]||{bg:'#F1F5F9',c:'#64748B',t:s};
  return<span style={{padding:'4px 10px',borderRadius:'6px',fontSize:'12px',fontWeight:'500',background:st.bg,color:st.c}}>{st.t}</span>}

function ClientsView({c,sq,ss}){
  return<div style={{background:'#FFF',borderRadius:'14px',padding:'24px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
      <h3 style={{fontSize:'18px',fontWeight:'600',color:'#0F172A',margin:0}}>Клиенты ({c.length})</h3>
      <div style={{display:'flex',gap:'8px'}}>
        <input placeholder="Поиск клиента..."value={sq}onChange={(e)=>ss(e.target.value)}style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',fontSize:'13px',outline:'none',fontFamily:'Inter'}}/>
        <button onClick={()=>alert('Форма добавления клиента')}style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:'#4F63FF',color:'#FFF',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>+ Добавить клиента</button>
      </div>
    </div>
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr style={{borderBottom:'1px solid #E8ECF2'}}>
        {['ID','Имя','Логин','Email','Телефон','Действия'].map(h=><th key={h}style={{padding:'12px 8px',textAlign:'left',fontSize:'12px',fontWeight:'600',color:'#64748B',textTransform:'uppercase'}}>{h}</th>)}
      </tr></thead>
      <tbody>{c.map(client=>(
        <tr key={client.id}style={{borderBottom:'1px solid #F1F5F9',transition:'background .15s',cursor:'pointer'}}
          onMouseEnter={(e)=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'}>
          <td style={{padding:'14px 8px',fontSize:'14px',color:'#64748B'}}>{client.id}</td>
          <td style={{padding:'14px 8px',fontSize:'14px',color:'#0F172A',fontWeight:'500'}}>{client.full_name||'—'}</td>
          <td style={{padding:'14px 8px',fontSize:'14px',color:'#64748B'}}>{client.username}</td>
          <td style={{padding:'14px 8px',fontSize:'14px',color:'#64748B'}}>{client.email||'—'}</td>
          <td style={{padding:'14px 8px',fontSize:'14px',color:'#64748B'}}>{client.phone_number||'—'}</td>
          <td style={{padding:'14px 8px'}}>
            <button onClick={()=>alert('Клиент: '+client.full_name)}style={{padding:'6px 12px',borderRadius:'6px',border:'1px solid #E8ECF2',background:'#FFF',color:'#64748B',fontSize:'12px',cursor:'pointer'}}>Просмотр</button>
          </td>
        </tr>
      ))}</tbody>
    </table>
    <p style={{fontSize:'12px',color:'#94A3B8',marginTop:'16px',marginBottom:0}}>Показано {c.length} клиентов</p>
  </div>}

function DealsView({o,sf,ss,so,onCreateOrder}){
  return<div style={{background:'#FFF',borderRadius:'14px',padding:'24px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
      <h3 style={{fontSize:'18px',fontWeight:'600',color:'#0F172A',margin:0}}>Все сделки ({o.length})</h3>
      <div style={{display:'flex',gap:'8px'}}>
        <select value={sf}onChange={(e)=>ss(e.target.value)}style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',fontSize:'13px',color:'#64748B',fontFamily:'Inter',cursor:'pointer'}}>
          <option value="all">Все статусы</option><option value="new">Новые</option><option value="in_progress">В работе</option><option value="completed">Завершены</option><option value="cancelled">Отменены</option>
        </select>
        <button onClick={onCreateOrder}style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:'#4F63FF',color:'#FFF',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>+ Новая сделка</button>
      </div>
    </div>
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr style={{borderBottom:'1px solid #E8ECF2'}}>
        {['ID','Клиент','Услуга','Статус','Сумма','Дата','Действия'].map(h=><th key={h}style={{padding:'12px 8px',textAlign:'left',fontSize:'12px',fontWeight:'600',color:'#64748B',textTransform:'uppercase'}}>{h}</th>)}
      </tr></thead>
      <tbody>{o.map(order=>(
        <tr key={order.id}style={{borderBottom:'1px solid #F1F5F9',cursor:'pointer',transition:'background .15s'}}
          onMouseEnter={(e)=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={(e)=>e.currentTarget.style.background='transparent'} onClick={()=>so(order)}>
          <td style={{padding:'14px 8px',fontSize:'14px',color:'#64748B'}}>#{order.id}</td>
          <td style={{padding:'14px 8px',fontSize:'14px',color:'#0F172A',fontWeight:'500'}}>{order.user_id}</td>
          <td style={{padding:'14px 8px',fontSize:'14px',color:'#64748B'}}>{order.service_id}</td>
          <td style={{padding:'14px 8px'}}><StatusPill s={order.status}/></td>
          <td style={{padding:'14px 8px',fontSize:'14px',fontWeight:'600',color:'#0F172A'}}>{order.total_cost?order.total_cost.toLocaleString()+' ₽':'—'}</td>
           <td style={{padding:'14px 8px',fontSize:'14px',color:'#64748B'}}>{order.date_requested?new Date(order.date_requested).toLocaleDateString('ru-RU'):'-'}</td>
          <td style={{padding:'14px 8px'}}>
            <button onClick={(e)=>{e.stopPropagation();so(order)}}style={{padding:'6px 12px',borderRadius:'6px',border:'1px solid #E8ECF2',background:'#FFF',color:'#64748B',fontSize:'12px',cursor:'pointer'}}>Просмотр</button>
          </td>
        </tr>
      ))}</tbody>
    </table>
    <p style={{fontSize:'12px',color:'#94A3B8',marginTop:'16px',marginBottom:0}}>Показано {o.length} сделок</p>
  </div>}

function PlaceholderView({t}){
  const icons={Tasks:'📋',Calendar:'📅',Messages:'💬',Analytics:'📊',Settings:'⚙️'};
  return<div style={{background:'#FFF',borderRadius:'14px',padding:'60px',textAlign:'center',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
    <div style={{fontSize:'48px',marginBottom:'16px'}}>{icons[t]||'🚧'}</div>
    <h3 style={{fontSize:'20px',fontWeight:'600',color:'#0F172A',margin:'0 0 8px'}}>{t}</h3>
    <p style={{fontSize:'14px',color:'#64748B',margin:'0 0 24px'}}>Этот раздел в разработке</p>
    <button onClick={()=>alert(t+' функция скоро появится!')}style={{padding:'12px 24px',borderRadius:'10px',border:'none',background:'#4F63FF',color:'#FFF',fontSize:'14px',fontWeight:'500',cursor:'pointer'}}>Уведомить меня</button>
  </div>}

function CalendarView({orders,clients}){
  const[events,setEvents]=useState([]);
  const[load,setLoad]=useState(true);
  useEffect(()=>{
    const evs=orders.map(o=>({
      id:o.id,
      title:`#${o.id} - Клиент #${o.user_id}`+(o.service_id?` (Услуга #${o.service_id})`:''),
      start:o.date_requested?new Date(o.date_requested):new Date(),
      end:o.date_requested?new Date(new Date(o.date_requested).getTime()+60*60*1000):new Date(),
      status:o.status,userId:o.user_id
    }));
    setEvents(evs);setLoad(false);
  },[orders]);
  const statusColors={new:'#3B82F6',accepted:'#F59E0B',in_progress:'#8B5CF6',completed:'#10B981',cancelled:'#EF4444'};
  const eventStyle=(event)=>({style:{backgroundColor:statusColors[event.status]||'#64748B',borderRadius:'6px',border:'none',color:'#FFF',fontSize:'12px',padding:'2px 6px'}});
  if(load)return<div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'400px',color:'#64748B'}}>Загрузка календаря...</div>;
  return<div style={{background:'#FFF',borderRadius:'14px',padding:'24px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
      <h3 style={{fontSize:'18px',fontWeight:'600',color:'#0F172A',margin:0}}>Календарь записей</h3>
      <div style={{display:'flex',gap:'12px',fontSize:'12px'}}>
        {Object.entries(statusColors).map(([k,v])=><div key={k}style={{display:'flex',alignItems:'center',gap:'4px'}}><div style={{width:'12px',height:'12px',borderRadius:'3px',background:v}}></div><span style={{color:'#64748B'}}>{{new:'Новый',accepted:'Принят',in_progress:'В работе',completed:'Завершён',cancelled:'Отменён'}[k]}</span></div>)}
      </div>
    </div>
    <div style={{height:'600px'}}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyle}
        messages={{month:'Месяц',week:'Неделя',day:'День',agenda:'Повестка дня',date:'Дата',time:'Время',event:'Событие',today:'Сегодня',previous:'Назад',next:'Вперёд',showMore:n=>`+ещё ${n}`}}
        culture='ru'
      />
    </div>
  </div>}

function MessagesView({clients,orders}){
  const[selectedUser,setSelectedUser]=useState(null);const[msg,setMsg]=useState('');const[sent,setSent]=useState([]);const[sending,setSending]=useState(false);const[search,setSearch]=useState('');
  const token=localStorage.getItem('access_token');
  const filteredClients=search?clients.filter(c=>(c.full_name||'').toLowerCase().includes(search.toLowerCase())||c.username.toLowerCase().includes(search.toLowerCase())):clients;
  const quickMessages=[
    'Ваш автомобиль готов к выдаче! Можете забрать его в удобное для вас время.',
    'Работы по вашему заказу начаты. Ожидаемое время выполнения — 2-3 дня.',
    'Ваша запись подтверждена. Ждём вас!',
    'Заказ ожидает поступления запчастей. Мы сообщим вам, когда всё будет готово.',
    'Спасибо, что выбрали AUTOHUB! Ждём вас снова.',
  ];
  const send=async()=>{if(!selectedUser||!msg.trim())return;setSending(true);
    try{await axios.post(API+'/notifications/send',{user_id:selectedUser.id,message:msg,type:'general'},{headers:{Authorization:'Bearer '+token}});
      setSent([{id:Date.now(),message:msg,created_at:new Date().toISOString(),username:selectedUser.username},...sent]);setMsg('');alert('Сообщение отправлено!');
    }catch{alert('Ошибка при отправке')}finally{setSending(false)}
  };
  return<div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:'20px'}}>
    <div style={{background:'#FFF',borderRadius:'14px',padding:'20px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)',height:'fit-content',maxHeight:'70vh',display:'flex',flexDirection:'column'}}>
      <h3 style={{fontSize:'16px',fontWeight:'600',color:'#0F172A',margin:'0 0 16px'}}>Клиенты</h3>
      <input placeholder="Поиск клиента..."value={search}onChange={(e)=>setSearch(e.target.value)}style={{width:'100%',padding:'8px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',fontSize:'13px',outline:'none',fontFamily:'Inter',marginBottom:'12px',boxSizing:'border-box'}}/>
      <div style={{overflowY:'auto',flex:1}}>
        {filteredClients.map(c=>(
          <div key={c.id}onClick={()=>setSelectedUser(c)}style={{padding:'10px 12px',borderRadius:'8px',cursor:'pointer',background:selectedUser?.id===c.id?'#EEF2FF':'transparent',transition:'background .15s',marginBottom:'4px'}}
            onMouseEnter={(e)=>{if(selectedUser?.id!==c.id)e.currentTarget.style.background='#F8FAFC'}} onMouseLeave={(e)=>{if(selectedUser?.id!==c.id)e.currentTarget.style.background='transparent'}}>
            <div style={{fontSize:'13px',fontWeight:'500',color:'#0F172A'}}>{c.full_name||c.username}</div>
            <div style={{fontSize:'11px',color:'#64748B'}}>@{c.username}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      {!selectedUser?<div style={{background:'#FFF',borderRadius:'14px',padding:'60px',textAlign:'center',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>💬</div>
        <h3 style={{fontSize:'18px',fontWeight:'600',color:'#0F172A',margin:'0 0 8px'}}>Выберите клиента</h3>
        <p style={{fontSize:'14px',color:'#64748B',margin:0}}>Выберите клиента из спика слева, чтобы отправить ему сообщение</p>
      </div>:<>
        <div style={{background:'#FFF',borderRadius:'14px',padding:'20px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'10px',background:'linear-gradient(135deg,#4F63FF,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',color:'#FFF',fontWeight:'600'}}>{(selectedUser.full_name||selectedUser.username)[0].toUpperCase()}</div>
            <div><div style={{fontSize:'15px',fontWeight:'600',color:'#0F172A'}}>{selectedUser.full_name||selectedUser.username}</div><div style={{fontSize:'12px',color:'#64748B'}}>@{selectedUser.username} {selectedUser.phone_number?`• ${selectedUser.phone_number}`:''}</div></div>
          </div>
          <textarea value={msg}onChange={(e)=>setMsg(e.target.value)}placeholder="Введите сообщение..."style={{width:'100%',minHeight:'100px',padding:'12px',borderRadius:'10px',border:'1px solid #E8ECF2',fontSize:'14px',outline:'none',fontFamily:'Inter',resize:'vertical',boxSizing:'border-box',marginBottom:'12px'}}/>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px',marginBottom:'12px'}}>
            {quickMessages.map((qm,i)=><button key={i}onClick={()=>setMsg(qm)}style={{padding:'6px 12px',borderRadius:'20px',border:'1px solid #E8ECF2',background:'#F8FAFC',color:'#64748B',fontSize:'12px',cursor:'pointer',textAlign:'left'}}>{qm.slice(0,40)}...</button>)}
          </div>
          <button onClick={send}disabled={!msg.trim()||sending}style={{width:'100%',padding:'12px',borderRadius:'10px',border:'none',background:msg.trim()?'#4F63FF':'#E8ECF2',color:msg.trim()?'#FFF':'#94A3B8',fontSize:'14px',fontWeight:'500',cursor:msg.trim()?'pointer':'not-allowed'}}>{sending?'Отправка...':'Отправить сообщение'}</button>
        </div>
        {sent.length>0&&<div style={{background:'#FFF',borderRadius:'14px',padding:'20px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
          <h4 style={{fontSize:'14px',fontWeight:'600',color:'#0F172A',margin:'0 0 12px'}}>Отправленные сообщения</h4>
          {sent.map(s=>(
            <div key={s.id}style={{padding:'10px 0',borderBottom:'1px solid #F1F5F9'}}>
              <div style={{fontSize:'13px',color:'#0F172A'}}>{s.message}</div>
              <div style={{fontSize:'11px',color:'#94A3B8',marginTop:'4px'}}>{new Date(s.created_at).toLocaleString('ru-RU')} • {s.username}</div>
            </div>
          ))}
        </div>}
      </>}
    </div>
  </div>}

function AnalyticsView({stats,rev,rp,sp,orders}){
  const totalOrders=orders.length;
  const statusCounts=orders.reduce((acc,o)=>{acc[o.status]=(acc[o.status]||0)+1;return acc;},{});
  const avgOrderValue=orders.length>0?orders.reduce((s,o)=>s+(o.total_cost||0),0)/orders.length:0;
  const topClients=orders.reduce((acc,o)=>{const k=o.user_id;acc[k]=(acc[k]||0)+1;return acc;},{});
  const topClientIds=Object.entries(topClients).sort((a,b)=>b[1]-a[1]).slice(0,5);
  return<>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'24px'}}>
      <Kpi t="Всего заказов"v={totalOrders} c="" ic="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" cl="#4F63FF"/>
      <Kpi t="Средний чек"v={avgOrderValue.toFixed(0)+' ₽'} c="" ic="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" cl="#10B981"/>
      <Kpi t="Выручка"v={orders.reduce((s,o)=>s+(o.total_cost||0),0).toLocaleString('ru-RU')+' ₽'} c="" ic="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" cl="#F59E0B"/>
      <Kpi t="Завершено"v={statusCounts.completed||0} c="" ic="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" cl="#8B5CF6"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'3fr 2fr',gap:'20px',marginBottom:'24px'}}>
      <RevChart d={rev} p={rp} sp={sp}/>
      <div style={{background:'#FFF',borderRadius:'14px',padding:'24px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
        <h3 style={{fontSize:'16px',fontWeight:'600',color:'#0F172A',margin:'0 0 20px'}}>Статусы заказов</h3>
        {Object.entries(statusCounts).map(([s,cnt])=>
          <div key={s}style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
            <div style={{width:'10px',height:'10px',borderRadius:'3px',background:{new:'#3B82F6',accepted:'#F59E0B',in_progress:'#8B5CF6',completed:'#10B981',cancelled:'#EF4444'}[s]||'#64748B'}}></div>
            <span style={{fontSize:'13px',color:'#64748B',flex:1}}>{{new:'Новый',accepted:'Принят',in_progress:'В работе',completed:'Завершён',cancelled:'Отменён'}[s]||s}</span>
            <span style={{fontSize:'13px',fontWeight:'600',color:'#0F172A'}}>{cnt}</span>
            <div style={{width:'60px',height:'6px',background:'#F1F5F9',borderRadius:'3px',overflow:'hidden'}}><div style={{width:`${(cnt/totalOrders)*100}%`,height:'100%',background:{new:'#3B82F6',accepted:'#F59E0B',in_progress:'#8B5CF6',completed:'#10B981',cancelled:'#EF4444'}[s]||'#64748B'}}></div></div>
          </div>
        )}
      </div>
    </div>
    <div style={{background:'#FFF',borderRadius:'14px',padding:'24px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
      <h3 style={{fontSize:'16px',fontWeight:'600',color:'#0F172A',margin:'0 0 20px'}}>Топ клиентов по заказам</h3>
      {topClientIds.length===0?<p style={{color:'#94A3B8',fontSize:'14px'}}>Нет данных</p>:
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr style={{borderBottom:'1px solid #E8ECF2'}}>
          <th style={{padding:'10px 0',textAlign:'left',fontSize:'12px',fontWeight:'600',color:'#64748B',textTransform:'uppercase'}}>ID Клиента</th>
          <th style={{padding:'10px 0',textAlign:'left',fontSize:'12px',fontWeight:'600',color:'#64748B',textTransform:'uppercase'}}>Кол-во заказов</th>
          <th style={{padding:'10px 0',textAlign:'left',fontSize:'12px',fontWeight:'600',color:'#64748B',textTransform:'uppercase'}}>Доля</th>
        </tr></thead>
        <tbody>{topClientIds.map(([id,cnt])=>(
          <tr key={id}style={{borderBottom:'1px solid #F1F5F9'}}>
            <td style={{padding:'12px 0',fontSize:'14px',color:'#0F172A',fontWeight:'500'}}>#{id}</td>
            <td style={{padding:'12px 0',fontSize:'14px',color:'#64748B'}}>{cnt}</td>
            <td style={{padding:'12px 0',fontSize:'14px',color:'#64748B'}}>{((cnt/totalOrders)*100).toFixed(1)}%</td>
          </tr>
        ))}</tbody>
      </table>}
    </div>
    <RevenueCalculator orders={orders}/>
  </>}

function RevenueCalculator({orders}){
  const[period,setPeriod]=useState('all');const[dateFrom,setDateFrom]=useState('');const[dateTo,setDateTo]=useState('');
  const statusMap={new:'Новые',accepted:'Принятые',in_progress:'В работе',completed:'Завершённые',cancelled:'Отменённые'};
  const filteredOrders=orders.filter(o=>{
    const d=o.date_requested?new Date(o.date_requested):null;
    if(dateFrom&&d&&d<new Date(dateFrom))return false;
    if(dateTo&&d&&d>new Date(dateTo+'T23:59:59'))return false;
    return true;
  });
  const totalRevenue=filteredOrders.reduce((s,o)=>s+(o.total_cost||0),0);
  const completedRevenue=filteredOrders.filter(o=>o.status==='completed').reduce((s,o)=>s+(o.total_cost||0),0);
  const pendingRevenue=filteredOrders.filter(o=>['new','accepted','in_progress'].includes(o.status)).reduce((s,o)=>s+(o.total_cost||0),0);
  const avgOrderValue=filteredOrders.length>0?totalRevenue/filteredOrders.length:0;
  const byStatus={};filteredOrders.forEach(o=>{if(!byStatus[o.status])byStatus[o.status]={count:0,revenue:0};byStatus[o.status].count++;byStatus[o.status].revenue+=o.total_cost||0});
  const byMonth={};filteredOrders.forEach(o=>{if(o.date_requested){const m=new Date(o.date_requested).toLocaleDateString('ru-RU',{year:'numeric',month:'long'});if(!byMonth[m])byMonth[m]={count:0,revenue:0};byMonth[m].count++;byMonth[m].revenue+=o.total_cost||0}});
  const maxMonthRevenue=Math.max(...Object.values(byMonth).map(m=>m.revenue),1);
  return<>
    <div style={{background:'#FFF',borderRadius:'14px',padding:'24px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)',marginBottom:'20px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',flexWrap:'wrap',gap:'12px'}}>
        <h3 style={{fontSize:'18px',fontWeight:'600',color:'#0F172A',margin:0}}>💰 Калькулятор доходов</h3>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          <input type="date"value={dateFrom}onChange={(e)=>setDateFrom(e.target.value)}style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',fontSize:'13px',color:'#64748B',fontFamily:'Inter',outline:'none'}}/>
          <input type="date"value={dateTo}onChange={(e)=>setDateTo(e.target.value)}style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',fontSize:'13px',color:'#64748B',fontFamily:'Inter',outline:'none'}}/>
          {(dateFrom||dateTo)&&<button onClick={()=>{setDateFrom('');setDateTo('')}}style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',background:'#F8FAFC',color:'#64748B',fontSize:'13px',cursor:'pointer'}}>✕ Сбросить</button>}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'16px',marginBottom:'20px'}}>
        <div style={{background:'linear-gradient(135deg,#4F63FF,#7C3AED)',borderRadius:'12px',padding:'20px',color:'#FFF'}}>
          <div style={{fontSize:'12px',opacity:0.8,marginBottom:'8px'}}>Общий доход</div>
          <div style={{fontSize:'24px',fontWeight:'700'}}>{totalRevenue.toLocaleString('ru-RU')} ₽</div>
          <div style={{fontSize:'11px',opacity:0.7,marginTop:'4px'}}>из {filteredOrders.length} заказов</div>
        </div>
        <div style={{background:'#F0FDF4',borderRadius:'12px',padding:'20px',border:'1px solid #BBF7D0'}}>
          <div style={{fontSize:'12px',color:'#166534',marginBottom:'8px'}}>✓ Завершённые</div>
          <div style={{fontSize:'24px',fontWeight:'700',color:'#166534'}}>{completedRevenue.toLocaleString('ru-RU')} ₽</div>
          <div style={{fontSize:'11px',color:'#15803D',marginTop:'4px'}}>{filteredOrders.filter(o=>o.status==='completed').length} заказов</div>
        </div>
        <div style={{background:'#FFFBEB',borderRadius:'12px',padding:'20px',border:'1px solid #FED7AA'}}>
          <div style={{fontSize:'12px',color:'#92400E',marginBottom:'8px'}}>⏳ В работе</div>
          <div style={{fontSize:'24px',fontWeight:'700',color:'#92400E'}}>{pendingRevenue.toLocaleString('ru-RU')} ₽</div>
          <div style={{fontSize:'11px',color:'#B45309',marginTop:'4px'}}>{filteredOrders.filter(o=>['new','accepted','in_progress'].includes(o.status)).length} заказов</div>
        </div>
        <div style={{background:'#F8FAFC',borderRadius:'12px',padding:'20px',border:'1px solid #E2E8F0'}}>
          <div style={{fontSize:'12px',color:'#475569',marginBottom:'8px'}}>⌀ Средний чек</div>
          <div style={{fontSize:'24px',fontWeight:'700',color:'#0F172A'}}>{avgOrderValue.toLocaleString('ru-RU',{maximumFractionDigits:0})} ₽</div>
          <div style={{fontSize:'11px',color:'#64748B',marginTop:'4px'}}>за 1 заказ</div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
        <div>
          <h4 style={{fontSize:'14px',fontWeight:'600',color:'#0F172A',margin:'0 0 12px'}}>По статусам</h4>
          {Object.entries(byStatus).map(([s,d])=>
            <div key={s}style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
              <div style={{width:'10px',height:'10px',borderRadius:'3px',background:{new:'#3B82F6',accepted:'#F59E0B',in_progress:'#8B5CF6',completed:'#10B981',cancelled:'#EF4444'}[s]||'#64748B'}}></div>
              <span style={{fontSize:'13px',color:'#64748B',flex:1}}>{statusMap[s]||s}</span>
              <span style={{fontSize:'13px',fontWeight:'600',color:'#0F172A'}}>{d.revenue.toLocaleString('ru-RU')} ₽</span>
              <span style={{fontSize:'11px',color:'#94A3B8'}}>({d.count})</span>
            </div>
          )}
        </div>
        <div>
          <h4 style={{fontSize:'14px',fontWeight:'600',color:'#0F172A',margin:'0 0 12px'}}>По месяцам</h4>
          {Object.keys(byMonth).length===0?<p style={{color:'#94A3B8',fontSize:'13px'}}>Нет данных</p>:
          Object.entries(byMonth).reverse().map(([m,d])=>
            <div key={m}style={{marginBottom:'10px'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                <span style={{fontSize:'13px',color:'#64748B'}}>{m}</span>
                <span style={{fontSize:'13px',fontWeight:'600',color:'#0F172A'}}>{d.revenue.toLocaleString('ru-RU')} ₽ <span style={{fontWeight:'400',color:'#94A3B8'}}>({d.count})</span></span>
              </div>
              <div style={{width:'100%',height:'8px',background:'#F1F5F9',borderRadius:'4px',overflow:'hidden'}}>
                <div style={{width:`${(d.revenue/maxMonthRevenue)*100}%`,height:'100%',background:'linear-gradient(90deg,#4F63FF,#7C3AED)',borderRadius:'4px',transition:'width .3s'}}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </>}

function OrderModal({o,c,onUpdate}){
  const[editing,setEditing]=useState(false);
  const[status,setStatus]=useState(o.status);
  const[totalCost,setTotalCost]=useState(o.total_cost||0);
  const[saving,setSaving]=useState(false);

  const statusOptions = [
    { value: 'new', label: 'Новый' },
    { value: 'confirmed', label: 'Подтверждён' },
    { value: 'accepted', label: 'Принят' },
    { value: 'in_progress', label: 'В работе' },
    { value: 'waiting_parts', label: 'Ожидает запчасти' },
    { value: 'completed', label: 'Завершён' },
    { value: 'cancelled', label: 'Отменён' },
  ];

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setSaving(true);
    try {
      await axios.put(`${API}/orders/${o.id}`, {
        status: status,
        total_cost: Number(totalCost),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onUpdate({ ...o, status, total_cost: Number(totalCost) });
      setEditing(false);
      c();
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Ошибка при обновлении заказа');
    } finally {
      setSaving(false);
    }
  };

  return<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:2000}}onClick={c}>
    <div style={{background:'#FFF',borderRadius:'20px',padding:'32px',width:'100%',maxWidth:'500px',maxHeight:'80vh',overflow:'auto'}}onClick={(e)=>e.stopPropagation()}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <h2 style={{fontSize:'20px',fontWeight:'700',color:'#0F172A',margin:0}}>Заказ #{o.id}</h2>
        <button onClick={c}style={{background:'none',border:'none',color:'#64748B',fontSize:'24px',cursor:'pointer',padding:'4px 8px'}}>×</button>
      </div>
      <div style={{display:'grid',gap:'16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #F1F5F9'}}><span style={{color:'#64748B'}}>ID клиента:</span><span style={{fontWeight:'500',color:'#0F172A'}}>{o.user_id}</span></div>
        <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #F1F5F9'}}><span style={{color:'#64748B'}}>ID услуги:</span><span style={{fontWeight:'500',color:'#0F172A'}}>{o.service_id}</span></div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #F1F5F9'}}>
          <span style={{color:'#64748B'}}>Статус:</span>
          {editing ? (
            <select value={status} onChange={(e)=>setStatus(e.target.value)} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #E8ECF2',fontSize:'13px',fontFamily:'Inter',outline:'none'}}>
              {statusOptions.map(opt=><option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          ) : (
            <StatusPill s={o.status}/>
          )}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #F1F5F9'}}>
          <span style={{color:'#64748B'}}>Сумма:</span>
          {editing ? (
            <input type="number" value={totalCost} onChange={(e)=>setTotalCost(e.target.value)} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #E8ECF2',fontSize:'13px',fontFamily:'Inter',outline:'none',width:'120px'}}/>
          ) : (
            <span style={{fontWeight:'600',color:'#0F172A'}}>{o.total_cost?o.total_cost.toLocaleString()+' ₽':'—'}</span>
          )}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #F1F5F9'}}><span style={{color:'#64748B'}}>Дата:</span><span style={{fontWeight:'500',color:'#0F172A'}}>{o.date_requested?new Date(o.date_requested).toLocaleString('ru-RU'):'-'}</span></div>
        <div style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #F1F5F9'}}><span style={{color:'#64748B'}}>Пробег:</span><span style={{fontWeight:'500',color:'#0F172A'}}>{o.mileage_at_order||'-'} км</span></div>
        {o.comment_from_client&&<div style={{padding:'12px 0',borderBottom:'1px solid #F1F5F9'}}><span style={{color:'#64748B',display:'block',marginBottom:'4px'}}>Комментарий:</span><span style={{color:'#0F172A'}}>{o.comment_from_client}</span></div>}
      </div>
      <div style={{display:'flex',gap:'12px',marginTop:'24px'}}>
        {editing ? (
          <>
            <button onClick={()=>{setEditing(false);setStatus(o.status);setTotalCost(o.total_cost||0);}} disabled={saving} style={{flex:1,padding:'12px',borderRadius:'10px',border:'1px solid #E8ECF2',background:'#FFF',color:'#64748B',fontSize:'14px',cursor:'pointer'}}>Отмена</button>
            <button onClick={handleSave} disabled={saving} style={{flex:1,padding:'12px',borderRadius:'10px',border:'none',background:'#10B981',color:'#FFF',fontSize:'14px',fontWeight:'500',cursor:'pointer'}}>{saving?'Сохранение...':'Сохранить'}</button>
          </>
        ) : (
          <>
            <button onClick={c}style={{flex:1,padding:'12px',borderRadius:'10px',border:'1px solid #E8ECF2',background:'#FFF',color:'#64748B',fontSize:'14px',cursor:'pointer'}}>Закрыть</button>
            <button onClick={()=>setEditing(true)}style={{flex:1,padding:'12px',borderRadius:'10px',border:'none',background:'#4F63FF',color:'#FFF',fontSize:'14px',fontWeight:'500',cursor:'pointer'}}>Редактировать</button>
          </>
        )}
      </div>
    </div>
  </div>}

function CreateOrderModal({api,clients,token,onClose,onCreated}){
  const[services,setServices]=useState([]);
  const[allCars,setAllCars]=useState([]);
  const[loading,setLoading]=useState(false);
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState('');
  const[form,setForm]=useState({client_id:'',car_id:'',service_id:'',date_requested:'',mileage_at_order:'',comment_from_client:''});

  useEffect(()=>{
    const fetchData=async()=>{
      if(!token)return;
      setLoading(true);
      try{
        const[sRes,cRes]=await Promise.all([
          axios.get(api+'/services/?skip=0&limit=100',{headers:{Authorization:'Bearer '+token}}),
          axios.get(api+'/cars/?skip=0&limit=1000',{headers:{Authorization:'Bearer '+token}})
        ]);
        setServices(sRes.data);setAllCars(cRes.data);
      }catch{setError('Ошибка загрузки данных')}finally{setLoading(false)}
    };
    fetchData();
  },[api,token]);

  const handleChange=e=>{setForm({...form,[e.target.name]:e.target.value})};

  const handleSubmit=async e=>{
    e.preventDefault();setError('');setSaving(true);
    if(!form.client_id||!form.car_id||!form.service_id||!form.date_requested){setError('Заполните обязательные поля');setSaving(false);return}
    try{
      const r=await axios.post(api+'/orders/',{
        user_id:Number(form.client_id),
        car_id:Number(form.car_id),
        service_id:Number(form.service_id),
        date_requested:new Date(form.date_requested).toISOString(),
        mileage_at_order:form.mileage_at_order?Number(form.mileage_at_order):null,
        comment_from_client:form.comment_from_client,
        status:'new',
        total_cost:0,
      },{headers:{Authorization:'Bearer '+token}});
      onCreated(r.data);
    }catch(err){setError('Ошибка создания сделки: '+(err.response?.data?.detail||'Неизвестная ошибка'))}finally{setSaving(false)}
  };

  const filteredCars=form.client_id?allCars.filter(c=>c.owner_id===Number(form.client_id)):[];

  return<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',justifyContent:'center',alignItems:'center',zIndex:2000}}onClick={onClose}>
    <div style={{background:'#FFF',borderRadius:'20px',padding:'32px',width:'100%',maxWidth:'520px',maxHeight:'80vh',overflow:'auto'}}onClick={(e)=>e.stopPropagation()}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
        <h2 style={{fontSize:'20px',fontWeight:'700',color:'#0F172A',margin:0}}>Новая сделка</h2>
        <button onClick={onClose}style={{background:'none',border:'none',color:'#64748B',fontSize:'24px',cursor:'pointer',padding:'4px 8px'}}>×</button>
      </div>
      {error&&<div style={{background:'#FEE2E2',color:'#991B1B',padding:'12px',borderRadius:'8px',marginBottom:'16px',fontSize:'14px'}}>{error}</div>}
      {loading?<div style={{textAlign:'center',padding:'40px',color:'#64748B'}}>Загрузка...</div>:
      <form onSubmit={handleSubmit} style={{display:'grid',gap:'16px'}}>
        <div>
          <label style={{fontSize:'13px',fontWeight:'600',color:'#0F172A',marginBottom:'6px',display:'block'}}>Клиент *</label>
          <select name="client_id"value={form.client_id}onChange={handleChange}required style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',fontSize:'14px',fontFamily:'Inter',outline:'none',boxSizing:'border-box'}}>
            <option value="">-- Выберите клиента --</option>
            {clients.filter(c=>c.role==='client').map(c=><option key={c.id}value={c.id}>{c.full_name||c.username} (@{c.username})</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:'13px',fontWeight:'600',color:'#0F172A',marginBottom:'6px',display:'block'}}>Автомобиль *</label>
          <select name="car_id"value={form.car_id}onChange={handleChange}required disabled={!form.client_id} style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',fontSize:'14px',fontFamily:'Inter',outline:'none',boxSizing:'border-box'}}>
            <option value="">-- Выберите автомобиль --</option>
            {filteredCars.map(car=><option key={car.id}value={car.id}>{car.brand} {car.model} ({car.license_plate||'Без номера'})</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:'13px',fontWeight:'600',color:'#0F172A',marginBottom:'6px',display:'block'}}>Услуга *</label>
          <select name="service_id"value={form.service_id}onChange={handleChange}required style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',fontSize:'14px',fontFamily:'Inter',outline:'none',boxSizing:'border-box'}}>
            <option value="">-- Выберите услугу --</option>
            {services.map(s=><option key={s.id}value={s.id}>{s.name} — {s.price} ₽</option>)}
          </select>
        </div>
        <div>
          <label style={{fontSize:'13px',fontWeight:'600',color:'#0F172A',marginBottom:'6px',display:'block'}}>Дата и время *</label>
          <input type="datetime-local"name="date_requested"value={form.date_requested}onChange={handleChange}required style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',fontSize:'14px',fontFamily:'Inter',outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div>
          <label style={{fontSize:'13px',fontWeight:'600',color:'#0F172A',marginBottom:'6px',display:'block'}}>Пробег (км)</label>
          <input type="number"name="mileage_at_order"value={form.mileage_at_order}onChange={handleChange}min="0" style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',fontSize:'14px',fontFamily:'Inter',outline:'none',boxSizing:'border-box'}}/>
        </div>
        <div>
          <label style={{fontSize:'13px',fontWeight:'600',color:'#0F172A',marginBottom:'6px',display:'block'}}>Комментарий</label>
          <textarea name="comment_from_client"value={form.comment_from_client}onChange={handleChange}rows="3" style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #E8ECF2',fontSize:'14px',fontFamily:'Inter',outline:'none',boxSizing:'border-box',resize:'vertical'}}></textarea>
        </div>
        <div style={{display:'flex',gap:'12px',marginTop:'8px'}}>
          <button type="button"onClick={onClose}disabled={saving} style={{flex:1,padding:'12px',borderRadius:'10px',border:'1px solid #E8ECF2',background:'#FFF',color:'#64748B',fontSize:'14px',cursor:'pointer'}}>Отмена</button>
          <button type="submit"disabled={saving} style={{flex:1,padding:'12px',borderRadius:'10px',border:'none',background:'#10B981',color:'#FFF',fontSize:'14px',fontWeight:'500',cursor:'pointer'}}>{saving?'Создание...':'Создать сделку'}</button>
        </div>
      </form>}
    </div>
  </div>}

function NotificationsView({notifications,setNotifications,setUnreadCount,api,token}){
  const[loading,setLoading]=useState(false);

  const markAllRead=async()=>{
    if(!token)return;
    setLoading(true);
    try{
      await Promise.all(notifications.filter(n=>!n.read).map(n=>axios.put(api+'/notifications/'+n.id,{is_read:true},{headers:{Authorization:'Bearer '+token}})));
      setNotifications(prev=>prev.map(n=>({...n,read:true})));
      setUnreadCount(0);
    }catch{console.error('Failed to mark all as read')}finally{setLoading(false)}
  };

  const markRead=async id=>{
    if(!token)return;
    try{await axios.put(api+'/notifications/'+id,{is_read:true},{headers:{Authorization:'Bearer '+token}});
      setNotifications(prev=>prev.map(n=>n.id===id?{...n,read:true}:n));
      setUnreadCount(prev=>Math.max(0,prev-1));
    }catch{console.error('Failed to mark as read')}
  };

  const deleteNotification=async id=>{
    if(!token)return;
    try{await axios.delete(api+'/notifications/'+id,{headers:{Authorization:'Bearer '+token}});
      setNotifications(prev=>prev.filter(n=>n.id!==id));
    }catch{console.error('Failed to delete notification')}
  };

  return<div style={{background:'#FFF',borderRadius:'14px',padding:'24px',border:'1px solid #E8ECF2',boxShadow:'0 4px 20px rgba(15,23,42,0.04)'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
      <h3 style={{fontSize:'18px',fontWeight:'600',color:'#0F172A',margin:0}}>Уведомления ({notifications.length})</h3>
      <div style={{display:'flex',gap:'8px'}}>
        {notifications.some(n=>!n.read)&&<button onClick={markAllRead} disabled={loading} style={{padding:'8px 16px',borderRadius:'8px',border:'none',background:'#10B981',color:'#FFF',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>{loading?'Сохранение...':'Отметить все как прочитанные'}</button>}
      </div>
    </div>
    {notifications.length===0?<div style={{padding:'40px',textAlign:'center',color:'#94A3B8'}}>Нет уведомлений</div>:
    <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
      {notifications.map(n=>(
        <div key={n.id} style={{display:'flex',alignItems:'flex-start',gap:'12px',padding:'16px',borderRadius:'12px',border:'1px solid #E8ECF2',background:n.read?'#FFF':'#F8FAFC',transition:'background .15s'}}>
          <div style={{width:'10px',height:'10px',borderRadius:'50%',background:n.read?'#94A3B8':'#4F63FF',marginTop:'6px',flexShrink:0}}></div>
          <div style={{flex:1}}>
            <p style={{fontSize:'14px',color:'#0F172A',margin:'0 0 4px',fontWeight:n.read?400:600}}>{n.text}</p>
            <p style={{fontSize:'12px',color:'#94A3B8',margin:0}}>{n.time}</p>
          </div>
          <div style={{display:'flex',gap:'6px',flexShrink:0}}>
            {!n.read&&<button onClick={()=>markRead(n.id)} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #E8ECF2',background:'#FFF',color:'#4F63FF',fontSize:'12px',cursor:'pointer'}}>Прочитано</button>}
            <button onClick={()=>deleteNotification(n.id)} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #E8ECF2',background:'#FFF',color:'#EF4444',fontSize:'12px',cursor:'pointer'}}>Удалить</button>
          </div>
        </div>
      ))}
    </div>}
  </div>}