const questions = [
  {id:'cloud-1',topic:'cloud',topicLabel:'Cloud concepts',question:'A retail website needs to add and remove compute capacity automatically as customer traffic changes. Which cloud benefit is the best fit?',options:['Agility','Elasticity','High availability','Reliability'],answer:1,explanation:'Elasticity is the automatic growth and shrinkage of resources with demand. Agility is about making changes quickly, but it does not specifically imply automatic resizing.',learn:'Think “stretch and return”: elasticity responds to the shape of demand.'},
  {id:'cloud-2',topic:'cloud',topicLabel:'Cloud concepts',question:'A team moves a few workloads to Azure but keeps sensitive database servers in its own datacenter. Which deployment model is this?',options:['Public cloud','Private cloud','Hybrid cloud','SaaS'],answer:2,explanation:'Hybrid cloud combines on-premises infrastructure with public cloud services. The two environments remain part of one overall solution.',learn:'If the scenario says “some stays here and some goes to Azure,” look for hybrid.'},
  {id:'cloud-3',topic:'cloud',topicLabel:'Cloud concepts',question:'A developer wants to deploy code without patching the operating system or managing virtual machines. Which service model matches?',options:['IaaS','PaaS','SaaS','Private cloud'],answer:1,explanation:'Platform as a service (PaaS) removes much of the infrastructure and operating-system management so the developer can focus on the application and data.',learn:'PaaS is the middle layer: you bring the application, Azure runs the platform.'},
  {id:'arch-1',topic:'architecture',topicLabel:'Azure architecture',question:'A company wants protection if one datacenter inside an Azure region loses power. What should it use?',options:['A region pair','An availability zone','A resource group','A management group'],answer:1,explanation:'Availability zones are physically separate datacenters within an Azure region. Deploying across zones can reduce the impact of a single datacenter failure.',learn:'Zones are inside a region; region pairs are between regions.'},
  {id:'arch-2',topic:'architecture',topicLabel:'Azure architecture',question:'A team wants one logical container for a web app’s VM, storage account, network, and database. What should it create?',options:['A resource group','A management group','A geography','A region pair'],answer:0,explanation:'A resource group is a logical container for related Azure resources. It helps organize, manage, and apply access or lifecycle operations to the solution.',learn:'Resource groups organize related resources; they are not physical locations.'},
  {id:'arch-3',topic:'architecture',topicLabel:'Azure architecture',question:'An organization needs an encrypted connection from its office to an Azure virtual network using the public internet. Which service fits?',options:['ExpressRoute','Azure VPN Gateway','Azure Bastion','Azure DNS'],answer:1,explanation:'VPN Gateway creates an encrypted VPN connection over the internet. ExpressRoute is the private connectivity option through a provider.',learn:'Internet tunnel = VPN Gateway. Private provider connection = ExpressRoute.'},
  {id:'gov-1',topic:'governance',topicLabel:'Management & governance',question:'A company must prevent new virtual machines from being deployed outside approved regions. Which tool should enforce this rule?',options:['Azure Advisor','Azure Policy','Resource locks','Tags'],answer:1,explanation:'Azure Policy evaluates and enforces organizational rules such as allowed locations. Advisor can recommend improvements, but it does not enforce the deployment restriction.',learn:'Policy answers “does this resource follow our rule?”'},
  {id:'gov-2',topic:'governance',topicLabel:'Management & governance',question:'A project owner wants to associate Azure costs with departments without moving any resources. What should they use?',options:['Availability sets','Resource tags','Management groups','Local network gateways'],answer:1,explanation:'Tags are name-value pairs such as Department=Finance or Project=Website. They help organize resources and analyze costs without changing resource location.',learn:'Tags add context to resources; they do not create a new container.'},
  {id:'gov-3',topic:'governance',topicLabel:'Management & governance',question:'A critical storage account must not be deleted accidentally, but administrators should still be able to change its settings. What should be applied?',options:['A ReadOnly lock','A CanNotDelete lock','Azure Policy','Microsoft Purview'],answer:1,explanation:'A CanNotDelete lock blocks deletion while allowing changes. A ReadOnly lock blocks changes as well as deletion.',learn:'CanNotDelete = edit is allowed, delete is not.'},
  {id:'gov-4',topic:'governance',topicLabel:'Management & governance',question:'A team wants suggestions for reducing Azure spending and improving reliability. Which service should they consult?',options:['Azure Monitor','Azure Advisor','Azure Service Health','Azure Arc'],answer:1,explanation:'Azure Advisor provides recommendations across cost, performance, reliability, security, and operational excellence. Monitor collects data and alerts; it does not serve as the recommendation engine.',learn:'Advisor advises. Monitor observes.'},
  {id:'gov-5',topic:'governance',topicLabel:'Management & governance',question:'A company needs to manage its on-premises servers from Azure without migrating them. Which service is designed for this?',options:['Azure Arc','Azure Functions','Azure Data Box','Azure App Service'],answer:0,explanation:'Azure Arc extends Azure management, governance, and security capabilities to servers and other resources outside Azure.',learn:'Arc is the bridge between Azure control and resources elsewhere.'},
  {id:'identity-1',topic:'identity',topicLabel:'Identity & security',question:'A user must complete MFA when signing in from an unfamiliar country, but not necessarily from the office. What should define this rule?',options:['Azure RBAC','Conditional Access','Single sign-on','Microsoft Entra Connect Sync'],answer:1,explanation:'Conditional Access evaluates conditions such as location, device, application, user, and risk, then applies a control such as requiring MFA.',learn:'Conditional Access is “if this condition, then this access requirement.”'},
  {id:'storage-1',topic:'storage',topicLabel:'Storage',question:'A web application needs to serve thousands of images and documents directly to browsers. Which storage service is the best fit?',options:['Azure Blob Storage','Azure Queue Storage','Azure Disk Storage','Azure Table Storage'],answer:0,explanation:'Blob Storage is designed for unstructured data such as images, documents, videos, and backups. It can serve objects to applications and browsers.',learn:'Blob means object-shaped, unstructured data.'},
  {id:'monitor-1',topic:'governance',topicLabel:'Management & governance',question:'A platform team wants an alert whenever a virtual machine’s CPU is above 80% for five minutes. Which tool should create the alert?',options:['Azure Advisor','Azure Monitor','Azure Policy','Microsoft Purview'],answer:1,explanation:'Azure Monitor collects metrics and can create alerts when a metric crosses a threshold for a specified period.',learn:'Monitor answers “what is happening right now?” and can notify you.'}
];

const topics = [
  {id:'all',index:'00',title:'All topics',desc:'A balanced warm-up across the blueprint.',color:'mint'},
  {id:'cloud',index:'01',title:'Cloud concepts',desc:'Models, benefits, responsibility, and service types.',color:'blue'},
  {id:'architecture',index:'02',title:'Azure architecture',desc:'Regions, compute, networking, and storage.',color:'sun'},
  {id:'governance',index:'03',title:'Management & governance',desc:'Cost, policy, locks, Arc, and monitoring.',color:'coral'},
  {id:'identity',index:'04',title:'Identity & security',desc:'Entra, access controls, and Zero Trust.',color:'teal'},
  {id:'storage',index:'05',title:'Storage',desc:'Blobs, files, tiers, redundancy, and migration.',color:'blue'}
];

const promptCards = [
  {tag:'Explain',title:'Make it plain',description:'Turn a dense cloud concept into a beginner-friendly explanation with one concrete analogy and one Azure example.',prompt:'Explain [AZURE CONCEPT] in simple terms for someone new to cloud computing. Use one everyday analogy, then give one accurate Azure example. End with one sentence describing what it is not.'},
  {tag:'Compare',title:'Untangle two services',description:'Use a side-by-side comparison when two exam options feel interchangeable.',prompt:'Compare [SERVICE A] and [SERVICE B] for AZ-900 preparation. Explain purpose, who manages what, a realistic use case, and the clue words that point to each service. Do not use recalled or copied exam questions.'},
  {tag:'Practice',title:'Give me a scenario',description:'Generate fresh practice without asking an AI assistant to reproduce exam content.',prompt:'Write 5 original AZ-900-style learning scenarios about [TOPIC]. Each should have 4 options, one best answer, a beginner-friendly explanation, and a short note explaining why the strongest distractor is wrong. Do not imitate or reproduce real exam questions.'},
  {tag:'Hint',title:'Nudge, don’t spoil',description:'Get a hint that keeps the reasoning work with the learner.',prompt:'I am deciding between [OPTION A] and [OPTION B] for this scenario: [SCENARIO]. Give me one hint about the deciding concept, but do not reveal the answer yet. Then ask me to choose.'},
  {tag:'Correct',title:'Review my mistake',description:'Turn an incorrect answer into a useful mental model.',prompt:'I chose [MY ANSWER] for this AZ-900 question: [QUESTION]. The correct answer is [CORRECT ANSWER]. Explain my likely misunderstanding in simple terms, contrast the two choices, and give me one new original mini-scenario to check my understanding.'},
  {tag:'Revise',title:'Build a review sheet',description:'Compress one weak topic into a short, repeatable revision note.',prompt:'Create a one-page AZ-900 revision sheet for [TOPIC]. Include the core definition, 5 key services or terms, 3 common comparisons, 3 exam clue phrases, and 5 original self-check questions with answers.'},
  {tag:'Localize',title:'Use a familiar example',description:'Connect an abstract service to a familiar African business or community setting.',prompt:'Explain [AZURE CONCEPT] using a respectful real-life example from an African context such as a school, clinic, small retailer, mobile-money service, farm cooperative, or public office. Keep the Azure explanation technically accurate and label the analogy as an analogy.'},
  {tag:'Coach',title:'Plan my next session',description:'Choose what to study next based on weak areas and available time.',prompt:'I have [MINUTES] minutes and my weak AZ-900 areas are [WEAK AREAS]. Build a focused study session with 3 learning blocks, one hands-on thought exercise, and a 5-question recap. Prioritize understanding over memorization.'}
];

let activeTopic='all';
let quizQuestions=[];
let currentIndex=0;
let selected=false;
let stats=JSON.parse(localStorage.getItem('az900-coach-stats')||'{"answered":0,"correct":0,"byTopic":{}}');

const $=selector=>document.querySelector(selector);
const $$=selector=>Array.from(document.querySelectorAll(selector));
function saveStats(){localStorage.setItem('az900-coach-stats',JSON.stringify(stats));updateReadiness();}
function shuffle(items){return [...items].sort(()=>Math.random()-.5)}
function topicQuestions(topic){return topic==='all'?questions:questions.filter(q=>q.topic===topic)}
function renderTopics(){
  $('#topicGrid').innerHTML=topics.map(t=>`<button class="topic-card ${t.id===activeTopic?'active':''}" data-topic="${t.id}"><span class="topic-index">${t.index}</span><h3>${t.title}</h3><p>${t.desc}</p><span class="count">${t.id==='all'?questions.length:questions.filter(q=>q.topic===t.id).length} questions</span></button>`).join('');
  $$('.topic-card').forEach(btn=>btn.addEventListener('click',()=>startTopic(btn.dataset.topic)));
}
function startTopic(topic='all'){
  activeTopic=topic; quizQuestions=shuffle(topicQuestions(topic)); currentIndex=0; selected=false; renderTopics(); renderQuestion(); window.location.hash='practice';
}
function renderQuestion(){
  if(!quizQuestions.length){$('#questionText').textContent='No questions in this lane yet.';return}
  const q=quizQuestions[currentIndex];
  $('#questionLabel').textContent=`Question ${currentIndex+1} of ${quizQuestions.length}`;
  $('#quizTopicChip').textContent=q.topicLabel;
  $('#questionProgress').style.width=`${((currentIndex)/quizQuestions.length)*100}%`;
  $('#questionText').textContent=q.question;
  $('#answers').innerHTML=q.options.map((option,i)=>`<button class="answer" data-answer="${i}"><span class="letter">${String.fromCharCode(65+i)}</span><span>${option}</span></button>`).join('');
  $('#feedback').className='feedback hidden'; $('#feedback').innerHTML=''; $('#nextButton').disabled=true; selected=false;
  $$('.answer').forEach(btn=>btn.addEventListener('click',()=>answerQuestion(Number(btn.dataset.answer))));
}
function answerQuestion(answer){
  if(selected) return; selected=true;
  const q=quizQuestions[currentIndex]; const correct=answer===q.answer;
  stats.answered++; if(correct) stats.correct++;
  stats.byTopic[q.topic]=stats.byTopic[q.topic]||{answered:0,correct:0}; stats.byTopic[q.topic].answered++; if(correct) stats.byTopic[q.topic].correct++;
  $$('.answer').forEach((btn,i)=>{btn.disabled=true;if(i===q.answer)btn.classList.add('correct');if(i===answer&&!correct)btn.classList.add('incorrect')});
  const feedback=$('#feedback'); feedback.className=`feedback ${correct?'':'error'}`; feedback.innerHTML=`<strong>${correct?'That’s it. Nice read.':'Not quite — use this as your clue.'}</strong><span>${q.explanation}</span><br /><span><b>Remember:</b> ${q.learn}</span>`;
  $('#nextButton').disabled=false; saveStats(); $('#streakText').textContent=correct?'Good instinct. Keep the streak going.':'A miss is useful data. Try the next one.';
}
function nextQuestion(){if(!selected)return; currentIndex=(currentIndex+1)%quizQuestions.length; renderQuestion()}
function skipQuestion(){if(!quizQuestions.length)return;currentIndex=(currentIndex+1)%quizQuestions.length;renderQuestion()}
function updateReadiness(){
  const pct=stats.answered?Math.round(stats.correct/stats.answered*100):0; $('#readinessNumber').textContent=`${pct}%`; $('#readinessBar').style.width=`${pct}%`; $('#answeredCount').textContent=`${stats.answered} answered`; $('#readinessCopy').textContent=stats.answered?`${stats.correct} correct so far. Review the explanations, not just the score.`:'Answer a few questions to reveal your starting point.';
}
function showView(view){
  $$('.nav-link').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===view));
  $('#learnView').className=view==='learn'?'view active-view':'view hidden-view'; $('#buddyView').className=view==='buddy'?'view active-view':'view hidden-view'; $('#aboutView').className=view==='about'?'view active-view':'view hidden-view'; window.scrollTo({top:0,behavior:'smooth'});
}
function renderPrompts(){ $('#promptGrid').innerHTML=promptCards.map((p,i)=>`<article class="prompt-card"><span class="prompt-tag">${p.tag}</span><h3>${p.title}</h3><p>${p.description}</p><button data-prompt="${i}">Copy prompt</button></article>`).join(''); $$('.prompt-card button').forEach(btn=>btn.addEventListener('click',()=>copyPrompt(Number(btn.dataset.prompt)))); }
async function copyPrompt(index){const p=promptCards[index].prompt; try{await navigator.clipboard.writeText(p);toast('Prompt copied. Add your topic and ask away.')}catch{toast(p)}}
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2800)}
function focusGovernance(){startTopic('governance');showView('learn');setTimeout(()=>$('#questionArea').scrollIntoView({behavior:'smooth',block:'center'}),250)}
function openCompare(){toast('Compare guide: Policy enforces rules · Locks block changes · Advisor recommends · Monitor measures.')}

$$('.nav-link').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));
$('#startButton').addEventListener('click',()=>{startTopic('all');showView('learn');setTimeout(()=>$('#questionArea').scrollIntoView({behavior:'smooth',block:'center'}),250)});
$('#goGovernance').addEventListener('click',focusGovernance); $('#compareButton').addEventListener('click',openCompare); $('#nextButton').addEventListener('click',nextQuestion); $('#skipButton').addEventListener('click',skipQuestion);
renderTopics(); renderPrompts(); updateReadiness(); startTopic('all');
