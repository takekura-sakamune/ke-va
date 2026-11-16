(() => {
 const cards=[
  ['放浪者','白','追い込み'],['軍師','白','差し'],['聖女','白','先行'],['女君主','白','逃げ'],
  ['上王','黒','差し'],['巫女頭','黒','逃げ'],['花嫁','黒','先行'],
  ['騎士','赤','先行'],['鍛冶師','赤','差し'],['呪医','赤','逃げ'],
  ['商人','青','先行'],['牛追','青','差し'],['受刑者','青','追い込み'],['死神','青','逃げ'],
  ['開拓者','黄','先行'],['酔狂','黄','差し'],['征服者','黄','追い込み'],['弓聖','黄','逃げ'],
  ['吟遊詩人','緑','追い込み'],['踊り子','緑','先行'],['刺客','緑','差し'],['探索者','緑','逃げ']
 ];
 const ranks=['1着','2着','3着'],colors=['白','黒','赤','青','黄','緑'],styles=['逃げ','先行','差し','追い込み'];
 const key='keva-memo-';
 const frameColors={白:'#e9e4d5',黒:'#353a40',赤:'#a64c45',青:'#456e96',黄:'#d5ad4d',緑:'#3d8064'},frameInk={白:'#24342d',黒:'#f2eee1',赤:'#fff8e9',青:'#fff8e9',黄:'#24342d',緑:'#fff8e9'};
 const numbers=Array.from({length:22},(_,n)=>[String(n),String(n)]);
 const counts=Array.from({length:4},(_,n)=>[String(n),`${n}枚`]);
 const field=(id,label,options,{multiple=false,disabled=false}={})=>`<select data-memo="${id}" aria-label="${label}"${multiple?' multiple':''}${disabled?' disabled':''}>${multiple?'':'<option value="">—</option>'}${options.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select>`;
 const placeField=(id,label)=>`<div class="memo-place-group" role="group" aria-label="${label}" data-place="${id}">${ranks.map((rank,i)=>`<button type="button" data-rank="${i}" aria-pressed="false" title="${rank}">${rank}</button>`).join('')}</div>`;
 const dialog=document.getElementById('memo-dialog');
 const rankTable=`<table><thead><tr><th></th><th>枠色</th><th>脚質</th><th>偶数</th><th>番号</th></tr></thead><tbody>${ranks.map((r,i)=>`<tr><th>${r}</th><td>${field(`rank-${i}-color`,`${r} 枠色`,colors.map(c=>[c,c]))}</td><td>${field(`rank-${i}-style`,`${r} 脚質`,styles.map(s=>[s,s]))}</td><td>${field(`rank-${i}-even`,`${r} 偶数`,[['yes','偶数'],['no','奇数']])}</td><td>${field(`rank-${i}-number`,`${r} 番号`,numbers)}</td></tr>`).join('')}</tbody></table>`;
 const countTable=`<table><thead><tr><th></th><th>枚数</th><th>場所</th></tr></thead><tbody>${colors.map(c=>`<tr><th>${c}枠</th><td>${field(`color-${c}-count`,`${c}枠 枚数`,counts)}</td><td>${placeField(`color-${c}-place`,`${c}枠の場所`)}</td></tr>`).join('')}</tbody></table>`;
 const styleTable=`<table><thead><tr><th></th><th>場所</th></tr></thead><tbody>${styles.map(s=>`<tr><th>${s}</th><td>${placeField(`style-${s}`,`${s}の場所`)}</td></tr>`).join('')}<tr><th>最大 − 最小</th><td>${field('range','最大 − 最小',Array.from({length:22},(_,n)=>[String(n),String(n)]))}</td></tr><tr><th>偶数の枚数</th><td>${field('even-count','偶数の枚数',counts)}</td></tr><tr><th>合計</th><td>${field('sum','番号の合計',Array.from({length:64},(_,n)=>[String(n),String(n)]))}</td></tr></tbody></table>`;
 const quickTable=`<div class="memo-quick-scroll"><table class="memo-quick"><thead><tr><th>番号</th><th>クラス</th><th>色</th><th>脚質</th><th>場・手元</th></tr></thead><tbody>${cards.map(([name,color,style],n)=>`<tr data-card-row="${n}"><th>${n}</th><td>${name}</td><td class="memo-color-cell" style="--memo-frame:${frameColors[color]};--memo-frame-ink:${frameInk[color]}">${color}</td><td>${style}</td><td>${field(`card-${n}`,`${n} ${name} 場・手元`,[['unknown','未確認']],{disabled:true})}</td></tr>`).join('')}</tbody></table></div>`;
 dialog.innerHTML=`<div class="memo-header"><div><span class="eyebrow">KE-VA! · NOTE</span><h2 id="memo-title">推理メモシート</h2><p>選択内容はこのブラウザに保存されます。場所は複数選択できます。</p></div><div class="memo-actions"><button type="button" id="memo-clear">メモを消去</button><button type="button" id="memo-close" class="primary">閉じる</button></div></div><section class="memo-results" aria-live="polite"><h3>公開・効果の結果</h3><div id="memo-results-content">対戦を始めると公開カードと効果の回答が表示されます。</div></section><div class="memo-layout"><section class="memo-panel"><h3>着順メモ</h3>${rankTable}<h3>枠色の枚数・場所</h3>${countTable}<h3>脚質・数字の情報</h3>${styleTable}</section><section class="memo-panel memo-reference"><h3>カード早見表</h3>${quickTable}</section></div>`;
 const read=(input)=>{try{const saved=localStorage.getItem(key+input.dataset.memo);if(saved===null)return;if(input.multiple){const values=JSON.parse(saved);[...input.options].forEach(o=>o.selected=values.includes(o.value))}else input.value=saved}catch{}};
 dialog.querySelectorAll('[data-memo]').forEach(input=>{read(input);if(!input.disabled)input.addEventListener('change',()=>{try{localStorage.setItem(key+input.dataset.memo,input.multiple?JSON.stringify([...input.selectedOptions].map(o=>o.value)):input.value)}catch{}})});
 const placeGroups=dialog.querySelectorAll('[data-place]');
 placeGroups.forEach(group=>{const id=group.dataset.place;let chosen=[];try{chosen=JSON.parse(localStorage.getItem(key+id)||'[]')}catch{}const paint=()=>group.querySelectorAll('[data-rank]').forEach(button=>{const active=chosen.includes(button.dataset.rank);button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active))});paint();group.addEventListener('click',event=>{const button=event.target.closest('[data-rank]');if(!button)return;const value=button.dataset.rank;chosen=chosen.includes(value)?chosen.filter(x=>x!==value):[...chosen,value];paint();try{localStorage.setItem(key+id,JSON.stringify(chosen))}catch{}})});
 function refresh(){
  const result=document.getElementById('memo-results-content');if(!result)return;
  const game=typeof g==='undefined'?null:g;
  if(!game){result.textContent='対戦を始めると公開カードと効果の回答が表示されます。';return}
  const entries=(game.logs||[]).slice(-18).reverse();
  if(!entries.length){result.textContent='公開・使用されたカードはまだありません。'}else{result.replaceChildren();entries.forEach(line=>{const article=document.createElement('article'),span=document.createElement('span');span.textContent=line.replace(/<br\s*\/?\s*>/gi,' · ').replace(/<[^>]*>/g,'');article.append(span);result.append(article)})}
  dialog.querySelectorAll('[data-memo^="card-"]').forEach(sel=>{const n=Number(sel.dataset.memo.slice(5));sel.replaceChildren(new Option('未確認','unknown'));let status='未確認';if(game){const rank=game.players[0].hidden.indexOf(n);const cardInField=game.field.find(c=>c.n===n);if(rank>=0)status=`自分の${ranks[rank]}札`;else if(game.players[0].hand.includes(n))status='自分の手札';else if(cardInField)status=`${cardInField.owner===0?'自分':'相手'}の${cardInField.mode==='publish'?'公開済み':'使用済み'}`;else if(game.done){const enemyRank=game.players[1].hidden.indexOf(n);if(enemyRank>=0)status=`相手の${ranks[enemyRank]}札`}}if(status!=='未確認')sel.add(new Option(status,status));sel.value=status==='未確認'?'unknown':status;dialog.querySelector(`[data-card-row="${n}"]`)?.classList.toggle('memo-known',status!=='未確認')});
 }
 document.addEventListener('click',event=>{if(event.target.closest('.memo-trigger')){refresh();if(!dialog.open)dialog.showModal()}});
 document.getElementById('memo-close').addEventListener('click',()=>dialog.close());
 document.getElementById('memo-clear').addEventListener('click',()=>{dialog.querySelectorAll('[data-memo]:not(:disabled)').forEach(input=>{input.value='';try{localStorage.removeItem(key+input.dataset.memo)}catch{}});placeGroups.forEach(group=>{group.querySelectorAll('[data-rank]').forEach(button=>{button.classList.remove('selected');button.setAttribute('aria-pressed','false')});try{localStorage.removeItem(key+group.dataset.place)}catch{}})});
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
 globalThis.KevaMemo={refresh};
})();
