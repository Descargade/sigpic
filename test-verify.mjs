export default async function run(page, ui) {
  // 1. Set auth in localStorage and navigate to diagramas
  await page.evaluate(() => {
    localStorage.setItem('sigpic-auth', JSON.stringify({
      username: 'dgonzalezcarreras',
      nombre: 'D. Gonzalez Carreras',
      cargo: 'Administrador'
    }));
  });
  
  await page.goto('https://sigpic.vercel.app/diagramas');
  await page.waitForTimeout(5000);
  
  // 2. Check ReactFlow loaded
  const rf = await page.evaluate(() => !!document.querySelector('.react-flow'));
  
  // 3. Count nodes
  const nodes = await page.evaluate(() => document.querySelectorAll('.react-flow__node').length);
  
  // 4. Check ReactFlow dimensions (viewport)
  const dims = await page.evaluate(() => {
    const rf = document.querySelector('.react-flow');
    if (!rf) return null;
    const r = rf.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), ratio: (r.height / r.width).toFixed(2) };
  });
  
  // 5. Check if the viewport container is vertical (height > width or fills page)
  const viewportFill = await page.evaluate(() => {
    const rf = document.querySelector('.react-flow');
    if (!rf) return null;
    const r = rf.getBoundingClientRect();
    return { 
      top: Math.round(r.top), 
      left: Math.round(r.left),
      bottom: Math.round(window.innerHeight - r.bottom),
      viewportH: Math.round(window.innerHeight),
      fillsVertically: r.top < 200 && (window.innerHeight - r.bottom) < 100
    };
  });
  
  // 6. Count grupo nodes
  const grupoCount = await page.evaluate(() => document.querySelectorAll('.react-flow__node-grupo').length);
  
  // 7. Try clicking a grupo node to expand
  let expanded = 0;
  if (grupoCount > 0) {
    const grupo = page.locator('.react-flow__node-grupo').first();
    await grupo.click();
    await page.waitForTimeout(2000);
    
    expanded = await page.evaluate(() => {
      const grupoNodes = document.querySelectorAll('.react-flow__node-grupo');
      let count = 0;
      grupoNodes.forEach(n => {
        const text = n.textContent || '';
        if (text.includes('Cant:')) count++;
      });
      return count;
    });
  }
  
  // 8. Check page title/header
  const header = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1 ? h1.textContent : null;
  });
  
  return {
    rf,
    nodes,
    dims,
    viewportFill,
    grupoCount,
    expanded,
    header,
    success: rf && nodes > 0 && grupoCount > 0 && expanded > 0
  };
}
