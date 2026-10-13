'use strict';
const accountDialog=$('account-dialog');
let accountSaving=false;
function accountProfile(user){
 const p=user?.user_metadata?.memory_profile||{};
 return {name:typeof p.name==='string'?p.name.slice(0,30):'',phone:typeof p.phone==='string'?p.phone.slice(0,24):'',theme:['blue','green','purple','apricot'].includes(p.theme)?p.theme:'blue'};
}
function applyAccountTheme(theme){document.documentElement.dataset.theme=theme;}
function syncAccountView(){
 const p=accountProfile(cloudUser);applyAccountTheme(p.theme);
 if(cloudUser)$('active-profile').textContent=(p.name||'已登录')+' · '+cloudUser.email+' · 云端记录';
}
function openAccount(){
 if(!cloudUser)return;
 const p=accountProfile(cloudUser);
 $('profile-name').value=p.name;$('profile-phone').value=p.phone;$('profile-email').textContent=cloudUser.email;
 $('email-verified').textContent=cloudUser.email_confirmed_at?'已验证':'待验证';
 document.querySelectorAll('[name="profile-theme"]').forEach(r=>r.checked=r.value===p.theme);
 $('profile-message').textContent='';accountDialog.showModal();
}
document.querySelectorAll('[name="profile-theme"]').forEach(r=>r.addEventListener('change',()=>applyAccountTheme(r.value)));
accountDialog.addEventListener('close',syncAccountView);
accountDialog.addEventListener('cancel',e=>{if(accountSaving)e.preventDefault()});
$('profile-form').addEventListener('submit',async e=>{
 e.preventDefault();if(accountSaving||!cloudUser)return;
 const name=$('profile-name').value.trim(),phone=$('profile-phone').value.trim();
 if(phone&&!/^\+?[0-9 ()-]{6,24}$/.test(phone)){$('profile-message').textContent='请填写有效的电话号码，或留空。';return;}
 const theme=document.querySelector('[name="profile-theme"]:checked').value;
 const userId=cloudUser.id,epoch=cloudEpoch;
 accountSaving=true;$('profile-form').querySelectorAll('input,button').forEach(x=>x.disabled=true);$('account-close').disabled=true;$('account-logout').disabled=true;
 $('profile-message').textContent='正在保存…';
 try{
  const verified=await cloudClient.auth.getUser();
  if(verified.error||verified.data.user?.id!==userId)throw Error('登录已失效，请重新登录。');
  const {data,error}=await cloudClient.auth.updateUser({data:{memory_profile:{name,phone,theme}}});
  if(epoch!==cloudEpoch)return;
  if(error||data.user?.id!==userId)throw Error('保存失败，请稍后重试，填写的内容已保留。');
  cloudUser=data.user;syncAccountView();$('profile-message').textContent='已保存，下次登录会恢复这些设置。';
 }catch(error){if(epoch===cloudEpoch)$('profile-message').textContent=error.message;}
 finally{accountSaving=false;$('profile-form').querySelectorAll('input,button').forEach(x=>x.disabled=false);$('account-close').disabled=false;$('account-logout').disabled=false;}
});
$('account-logout').addEventListener('click',()=>$('logout').click());
