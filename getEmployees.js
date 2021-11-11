// Fetches and extract names and images from confluence page 
// If you've come here to learn good practises, look elsewhere..

const getEmployees = async  () => {
  const data = await fetch(
    'https://enturas.atlassian.net/wiki/spaces/EDT/pages/673087563/Hvem+er+hvem',
    { credentials: 'include', sameSite: false }
  )
    .then((result) => {
      if (result.redirected) {
        throw 'Error loading employees';
      } else {
        return result.text();
      }
    })
    .then((html) => {
      const employees = [];
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const tables = Array.from(doc.querySelectorAll('tbody'));
        tables.forEach((table) => {
        const tableDatas = table.querySelectorAll('.confluenceTd');
        const names = Array.from(tableDatas)
          .filter((td) => td.className === 'confluenceTd')
          .filter((td) => td.firstChild.tagName !== "P" || td.firstChild.className !== 'content-wrapper' )
          .filter((td) => td.firstChild.textContent !== '')
          .filter((td) => {
            if (td.firstChild) {
                return !["H1","H2","H3","H4","H5"].includes(td.firstChild.tagName);
            }
            return td
          })
          .map((td) => td.firstChild.innerHTML || td.innerHTML)
          .map(innerHTML => {
            if (innerHTML.startsWith('<a href')) {
              return innerHTML.match(/\>(.*?)\</)[1];
            }
            if (innerHTML.startsWith('<p')) {
              return innerHTML.match(/\>(.*?)\</)[1];
            }
            if (innerHTML.includes('<br')) {
              return innerHTML.match(/^(.*?)<br/)[1]
            }
            return innerHTML
          })
          .map(name => name.replace("<span>", '').trim());
        
          const imgs = Array.from(table.querySelectorAll('img'))
            .filter(img => {
              const alias = img.getAttribute("data-linked-resource-default-alias")
              if (alias && alias.includes("slack.png")){
                return false
              } 
              return true
            })
             

          if (imgs.length !== names.length) {
            console.error(`Names(${names.length}) and images(${imgs.length}) doesn't match:`)
            console.error({names, imgs})
            return
          }
          names.forEach((name,i) => {
              employees.push({
                name,
                img: imgs[i].getAttribute("src")
              })
          })
        })
        return employees
      })
    .catch((e) => {
      console.error(e);
      throw e;
    });

  return data;
};

