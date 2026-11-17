const concepts = {
  tea: { name: '茶', description: '用植物的叶与热水制成的一种饮品。', branches: [['叶', '热水'], ['饮品', '植物']] },
  umbrella: { name: '雨伞', description: '人们在下雨时用来遮挡雨水的物品。', branches: [['雨水', '遮挡'], ['物品', '雨水']] },
  bookmark: { name: '书签', description: '放在书中，用来记住阅读位置的小物件。', branches: [['书', '位置'], ['物品', '阅读']] },
  leaf: { name: '叶', description: '植物的一部分。', branches: [['植物']] },
  hotwater: { name: '热水', description: '温度较高的水。', branches: [['水']] },
  drink: { name: '饮品', description: '可以饮用的东西。', branches: [] },
  plant: { name: '植物', description: '生长在自然中的生物。', branches: [] },
  rain: { name: '雨水', description: '从云中落下的水。', branches: [['水']] },
  cover: { name: '遮挡', description: '使一件东西挡在另一件东西前面。', branches: [] },
  object: { name: '物品', description: '可以使用或拿取的东西。', branches: [] },
  book: { name: '书', description: '由文字或图画组成、供人阅读的作品。', branches: [['阅读']] },
  position: { name: '位置', description: '事物所在的地方。', branches: [] },
  reading: { name: '阅读', description: '理解文字或图画的活动。', branches: [] },
  water: { name: '水', description: '一种常见的液体。', branches: [] },
};
const ids = Object.fromEntries(Object.entries(concepts).map(([id, item]) => [item.name, id]));
const known = new Set();
const expanded = new Set();
const choices = {};
let selected = 'tea';
const results = document.querySelector('#results');
const path = document.querySelector('#path');
const search = document.querySelector('#search');
function renderResults() {
  const q = search.value.trim().toLowerCase();
  const entries = Object.entries(concepts).filter(([id, item]) => !q ? ['tea', 'umbrella', 'bookmark'].includes(id) : item.name.includes(q) || id.includes(q));
  results.replaceChildren();
  if (!entries.length) { results.textContent = '没有找到这个演示概念，试试其他词。'; return; }
  entries.forEach(([id, item]) => {
    const button = document.createElement('button'); button.className = 'concept' + (selected === id ? ' active' : '');
    const name = document.createElement('strong'); name.textContent = item.name;
    const description = document.createElement('span'); description.textContent = item.description;
    button.append(name, description); button.onclick = () => { selected = id; expanded.add(id); render(); }; results.append(button);
  });
}
function renderNode(id, ancestors = []) {
  const item = concepts[id]; const card = document.createElement('div'); card.className = 'node';
  const heading = document.createElement('div'); heading.className = 'node-heading';
  const title = document.createElement('strong'); title.textContent = item.name;
  const mark = document.createElement('button'); mark.className = known.has(id) ? 'mark marked' : 'mark'; mark.textContent = known.has(id) ? '✓ 已理解' : '我懂'; mark.setAttribute('aria-pressed', String(known.has(id))); mark.onclick = () => { known.has(id) ? known.delete(id) : known.add(id); render(); };
  heading.append(title, mark); card.append(heading);
  const description = document.createElement('p'); description.textContent = item.description; card.append(description);
  if (known.has(id)) return card;
  if (ancestors.includes(id)) { const cycle = document.createElement('p'); cycle.textContent = '路径在此处形成循环。'; card.append(cycle); return card; }
  if (!item.branches.length) { const end = document.createElement('span'); end.className = 'end'; end.textContent = '演示中的基础概念'; card.append(end); return card; }
  const toggle = document.createElement('button'); toggle.className = 'toggle'; toggle.textContent = expanded.has(id) ? '收起解释 ↑' : '展开解释 ↓'; toggle.setAttribute('aria-expanded', String(expanded.has(id))); toggle.onclick = () => { expanded.has(id) ? expanded.delete(id) : expanded.add(id); render(); }; card.append(toggle);
  if (expanded.has(id)) {
    if (item.branches.length > 1) { const label = document.createElement('label'); label.className = 'branch-label'; label.textContent = '解释方式 '; const select = document.createElement('select'); item.branches.forEach((_, i) => { const opt = document.createElement('option'); opt.value = String(i); opt.textContent = `方式 ${i + 1}`; select.append(opt); }); select.value = String(choices[id] || 0); select.onchange = () => { choices[id] = Number(select.value); render(); }; label.append(select); card.append(label); }
    const children = document.createElement('div'); children.className = 'children';
    item.branches[choices[id] || 0].forEach(name => children.append(renderNode(ids[name], [...ancestors, id]))); card.append(children);
  }
  return card;
}
function render() { renderResults(); path.replaceChildren(renderNode(selected)); }
search.addEventListener('input', renderResults);
document.querySelector('#reset').onclick = () => { known.clear(); render(); };
expanded.add(selected); render();
