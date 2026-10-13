const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let user={id:'test-user',email:'test@example.com',email_confirmed_at:'2026-10-13',user_metadata:{other:'keep'}};let fail=false;
 await page.exposeFunction('mockUser',()=>user);
 await page.exposeFunction('mockSave',p=>{if(fail)return {error:{message:'offline'}};user={...user,user_metadata:{...user.user_metadata,...p.data}};return {data:{user},error:null}});
 await page.route('**/vendor/supabase.js',r=>r.fulfill({contentType:'application/javascript',body:`window.supabase={createClient:()=>({auth:{getUser:async()=>({data:{user:await window.mockUser()}}),updateUser:window.mockSave,onAuthStateChange:()=>{},signOut:async()=>({error:null})},from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data:{data:{entries:[],memories:[]},revision:1}})})})})})};`}));
 await page.goto('file:///F:/AI小智/9月26日/memory-tree-pages/cloud.html');
 await page.locator('#open-account').click();await page.locator('#profile-name').fill('小溪');
 await page.locator('[value="purple"]').check();assert.equal(await page.locator('html').getAttribute('data-theme'),'purple');
 await page.locator('#account-close').click();await page.waitForFunction(()=>document.documentElement.dataset.theme==='blue');assert.equal(await page.locator('html').getAttribute('data-theme'),'blue');
 await page.locator('#open-account').click();await page.locator('#profile-name').fill('小溪');await page.locator('[value="green"]').check();
 await page.locator('#profile-phone').fill('13800138000');await page.locator('#profile-form button[type=submit]').click();
 await page.waitForFunction(()=>document.getElementById('profile-message').textContent.startsWith('已保存'));
 assert.equal(user.user_metadata.other,'keep');assert.equal(user.user_metadata.memory_profile.name,'小溪');
 await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.theme==='green');
 await page.locator('#open-account').click();assert.equal(await page.locator('#profile-phone').inputValue(),'13800138000');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.equal(await page.locator('#account-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth),true);
 fail=true;await page.locator('#profile-name').fill('保留输入');await page.locator('#profile-form button[type=submit]').click();
 await page.waitForFunction(()=>document.getElementById('profile-message').textContent.startsWith('保存失败'));
 assert.equal(await page.locator('#profile-name').inputValue(),'保留输入');
 await page.locator('#account-logout').click();await page.waitForFunction(()=>document.getElementById('active-profile').textContent==='未登录');
 assert.equal(await page.locator('html').getAttribute('data-theme'),'blue');assert.equal(await page.locator('#account-dialog').evaluate(e=>e.open),false);
 assert.deepEqual(errors,[]);console.log('PASS: profile save/reload, metadata preservation, preview cancel, failure retention, mobile layout, logout isolation');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

