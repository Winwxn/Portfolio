document.addEventListener("DOMContentLoaded", () => {
  const videoContainer = document.getElementById("cms-video-container");
  const graphicContainer = document.getElementById("cms-graphic-container");

  function finishPageLoading() {
    const triggerHide = () => {
      if (typeof window.hidePreloader === "function") {
        setTimeout(() => window.hidePreloader(), 300);
      }
    };

    if (document.readyState === "complete") {
      triggerHide();
    } else {
      window.addEventListener("load", triggerHide, { once: true });
    }
  }

  function waitForMediaToLoad(containerEl) {
    if (!containerEl) {
      finishPageLoading();
      return;
    }

    const mediaElements = Array.from(containerEl.querySelectorAll("iframe, img"));
    if (mediaElements.length === 0) {
      finishPageLoading();
      return;
    }

    let loadedCount = 0;
    const totalCount = mediaElements.length;
    let isDone = false;

    function markOneLoaded() {
      if (isDone) return;
      loadedCount++;
      if (loadedCount >= totalCount) {
        isDone = true;
        finishPageLoading();
      }
    }

    mediaElements.forEach(el => {
      if (el.tagName === "IMG" && el.complete) {
        markOneLoaded();
      } else {
        el.addEventListener("load", markOneLoaded, { once: true });
        el.addEventListener("error", markOneLoaded, { once: true });
      }
    });
  }

  if (videoContainer || graphicContainer) {
    const jsonUrl = window.location.pathname.includes('/work/') ? '../data/database.json' : 'data/database.json';
    
    fetch(jsonUrl + "?t=" + new Date().getTime())
      .then(res => res.json())
      .then(data => {
        const projects = data.projects || [];
        
        if (videoContainer) {
          const highlightVideoProjects = projects.filter(p => p.category === "Highlight Video");
          const videoProjects = projects.filter(p => p.category === "Video Editor");
          
          videoContainer.innerHTML = '';
          const hlDiv = document.createElement('div');
          const prjDiv = document.createElement('div');
          videoContainer.appendChild(hlDiv);
          videoContainer.appendChild(prjDiv);
          
          renderHighlights(highlightVideoProjects, hlDiv, 'video');
          renderProjects(videoProjects, prjDiv, 'video');
          waitForMediaToLoad(videoContainer);
        }
        
        if (graphicContainer) {
          const highlightGraphicProjects = projects.filter(p => p.category === "Highlight Graphic");
          const graphicProjects = projects.filter(p => p.category === "Graphic Design");
          
          graphicContainer.innerHTML = '';
          const hlDiv = document.createElement('div');
          const prjDiv = document.createElement('div');
          graphicContainer.appendChild(hlDiv);
          graphicContainer.appendChild(prjDiv);
          
          renderHighlights(highlightGraphicProjects, hlDiv, 'image');
          renderProjects(graphicProjects, prjDiv, 'image');
          waitForMediaToLoad(graphicContainer);
        }
      })
      .catch(err => {
        console.error("Error loading CMS data:", err);
        if (videoContainer) videoContainer.innerHTML = '<div class="text-center text-danger">Failed to load projects.</div>';
        if (graphicContainer) graphicContainer.innerHTML = '<div class="text-center text-danger">Failed to load projects.</div>';
        finishPageLoading();
      });
  }

  function resolveItemBrand(item, projectBrands) {
    if (item.brand && item.brand.trim() !== '') {
      return item.brand.trim();
    }
    const desc = (item.description || '').trim();
    if (desc && projectBrands.length > 0) {
      for (const b of projectBrands) {
        if (desc.toLowerCase().startsWith(b.toLowerCase())) {
          return b;
        }
      }
    }
    return '';
  }

  function pauseIframesInElement(rootEl) {
    if (!rootEl) return;
    const iframes = rootEl.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const currentSrc = iframe.src;
      if (currentSrc) {
        iframe.src = '';
        iframe.src = currentSrc;
      }
    });
  }

  function renderProjects(projects, container, type) {
    if (projects.length === 0) {
      container.innerHTML = `<div class="text-center text-secondary py-5">ยังไม่มีผลงานอัปโหลดในระบบ</div>`;
      return;
    }

    const accordionId = `accordion-${type}`;
    let html = `
      <div class="container mb-5 reveal active">
        <div class="text-center mb-4 text-secondary" style="animation: fadeIn 0.5s ease;">
          <span style="background: rgba(255,255,255,0.7); padding: 8px 20px; border-radius: 30px; backdrop-filter: blur(10px); border: 1px solid rgba(0,0,0,0.05); display: inline-block; box-shadow: 0 2px 10px rgba(0,0,0,0.02); font-size: 0.95rem;">
            💡 สามารถกดเลือกที่ชื่อโปรเจกต์ด้านล่าง เพื่อดูผลงานได้เลยครับ
          </span>
        </div>
        <div class="accordion" id="${accordionId}">
    `;
    
    projects.forEach((project, index) => {
      const isFirst = false; // ปิด Accordion ไว้ทั้งหมดโดยเริ่มต้น
      const collapseId = `collapse-${type}-${index}`;
      const headingId = `heading-${type}-${index}`;
      const items = project.items || [];

      // รวบรวมรายชื่อแบรนด์ของบริษัทนี้ (จาก project.brands และจาก item.brand)
      const configuredBrands = Array.isArray(project.brands)
        ? project.brands.map(b => (b || '').trim()).filter(Boolean)
        : [];
      const brandSet = new Set(configuredBrands);
      items.forEach(item => {
        const b = resolveItemBrand(item, configuredBrands);
        if (b) brandSet.add(b);
      });
      const brandList = Array.from(brandSet);
      const hasBrands = brandList.length > 0;

      // นับจำนวนผลงานในแต่ละแบรนด์
      const brandCounts = {};
      brandList.forEach(b => { brandCounts[b] = 0; });
      items.forEach(item => {
        const b = resolveItemBrand(item, brandList);
        if (b && brandCounts[b] !== undefined) {
          brandCounts[b]++;
        }
      });

      // ป้ายกำกับแบรนด์บนหัวกล่องบริษัท
      let headerBadgesHtml = '';
      if (hasBrands) {
        headerBadgesHtml = `<span class="ms-2 d-inline-flex flex-wrap gap-1 align-items-center">` +
          brandList.map(b => `<span class="header-brand-badge">${b}</span>`).join('') +
          `</span>`;
      }

      // แถบปุ่มแท็บเลือกแบรนด์ด้านในกล่องบริษัท
      let brandTabsHtml = '';
      if (hasBrands) {
        brandTabsHtml = `
          <div class="text-center mb-2">
            <div class="brand-filter-bar" data-project-index="${index}">
              <button type="button" class="brand-tab-btn active" data-brand="__all__">
                <span>ทั้งหมด</span>
                <span class="brand-tab-count">${items.length}</span>
              </button>
              ${brandList.map(b => `
                <button type="button" class="brand-tab-btn" data-brand="${b}">
                  <span>${b}</span>
                  <span class="brand-tab-count">${brandCounts[b] || 0}</span>
                </button>
              `).join('')}
            </div>
          </div>
        `;
      }

      html += `
        <div class="accordion-item mb-4" style="border-radius: 12px; border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px);">
          <h2 class="accordion-header" id="${headingId}">
            <button class="accordion-button ${isFirst ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${isFirst ? 'true' : 'false'}" aria-controls="${collapseId}" style="font-size: 1.25rem; font-weight: 600; color: #111; padding: 1.5rem; background-color: transparent; box-shadow: none;">
              <span class="d-flex flex-wrap align-items-center gap-1">
                <span>${project.title}</span>
                ${headerBadgesHtml}
              </span>
            </button>
          </h2>
          <div id="${collapseId}" class="accordion-collapse collapse ${isFirst ? 'show' : ''}" aria-labelledby="${headingId}" data-bs-parent="#${accordionId}">
            <div class="accordion-body" style="padding: 2rem 1.5rem;">
              ${brandTabsHtml}
              <div class="row justify-content-center project-items-grid" data-project-index="${index}">
      `;

      items.forEach(item => {
        let mediaHtml = '';
        let driveId = extractDriveId(item.url);
        const itemBrand = resolveItemBrand(item, brandList);
        
        if (type === 'video') {
           if (driveId) {
             mediaHtml = `<iframe src="https://drive.google.com/file/d/${driveId}/preview" width="100%" height="100%" style="border:none; border-radius: 12px; min-height: 55vh; background: #000;"></iframe>`;
           } else {
             mediaHtml = `<div class="p-5 text-secondary border border-dashed rounded">Invalid Google Drive Link</div>`;
           }
        } else {
           if (driveId) {
             mediaHtml = `<img src="https://lh3.googleusercontent.com/d/${driveId}" class="img-fluid rounded-3 shadow-sm" style="width:100%; object-fit:contain;" alt="${item.description}">`;
           } else {
             mediaHtml = `<img src="${item.url}" class="img-fluid rounded-3 shadow-sm" style="width:100%; object-fit:contain;" alt="${item.description}">`;
           }
        }

        const colClass = 'col-lg-4 col-md-6 col-12 mb-4 project-item-col';
        const brandBadgeHtml = (hasBrands && itemBrand) ? `<span class="item-brand-tag">${itemBrand}</span>` : '';
        
        html += `
                <div class="${colClass}" data-item-brand="${itemBrand}">
                  <div class="skill-card p-3 p-md-4 text-center h-100 d-flex flex-column justify-content-center bg-white" style="border-radius: 12px; min-height: auto; cursor: default; transform: none; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
                    ${mediaHtml}
                    ${brandBadgeHtml}
                    <h6 class="mt-2 mb-0 fw-bold text-secondary">${item.description}</h6>
                  </div>
                </div>
        `;
      });

      html += `
                <div class="col-12 text-center py-5 text-secondary empty-brand-msg d-none">
                  ยังไม่มีผลงานในหมวดแบรนด์นี้
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    container.innerHTML = html;

    // ผูกการทำงานของปุ่มแท็บเลือกแบรนด์ (Brand Filter Tabs)
    const filterBars = container.querySelectorAll('.brand-filter-bar');
    filterBars.forEach(bar => {
      const buttons = bar.querySelectorAll('.brand-tab-btn');
      const accordionBody = bar.closest('.accordion-body');
      const itemCols = accordionBody.querySelectorAll('.project-item-col');
      const emptyMsg = accordionBody.querySelector('.empty-brand-msg');

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const selectedBrand = btn.getAttribute('data-brand');

          // อัปเดตสถานะปุ่ม Active
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          let visibleCount = 0;
          itemCols.forEach(col => {
            const itemBrand = col.getAttribute('data-item-brand') || '';
            const shouldShow = (selectedBrand === '__all__') || (itemBrand.toLowerCase() === selectedBrand.toLowerCase());

            if (shouldShow) {
              col.classList.remove('d-none');
              visibleCount++;
            } else {
              if (!col.classList.contains('d-none') && type === 'video') {
                pauseIframesInElement(col);
              }
              col.classList.add('d-none');
            }
          });

          if (emptyMsg) {
            if (visibleCount === 0) {
              emptyMsg.textContent = `ยังไม่มีผลงานในหมวดแบรนด์ ${selectedBrand}`;
              emptyMsg.classList.remove('d-none');
            } else {
              emptyMsg.classList.add('d-none');
            }
          }
        });
      });
    });

    // เพิ่มระบบเลื่อนหน้าจอ (Scroll) อัตโนมัติเมื่อกดเปิด Accordion และหยุดวิดีโอเมื่อพับเก็บ
    const collapseElements = container.querySelectorAll('.accordion-collapse');
    collapseElements.forEach(el => {
      el.addEventListener('shown.bs.collapse', function (e) {
        const header = e.target.previousElementSibling;
        const headerOffset = header.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: headerOffset - 100,
          behavior: 'smooth'
        });
      });

      el.addEventListener('hide.bs.collapse', function (e) {
        if (type === 'video') {
          pauseIframesInElement(e.target);
        }
      });
    });
  }

  function renderHighlights(projects, container, type) {
    if (projects.length === 0) return; 

    let html = `
      <div class="container mb-5 reveal active">
        <h3 class="text-center fw-bold mb-4" style="color: #111;">Example Works</h3>
        <div class="row justify-content-center">
    `;

    let allItems = [];
    projects.forEach(p => {
      if (p.items) allItems = allItems.concat(p.items);
    });
    
    const limitedItems = allItems.slice(0, 3);

    limitedItems.forEach(item => {
      let mediaHtml = '';
      let driveId = extractDriveId(item.url);
      
      if (type === 'video') {
         if (driveId) {
           mediaHtml = `<iframe src="https://drive.google.com/file/d/${driveId}/preview" width="100%" height="100%" style="border:none; border-radius: 12px; min-height: 55vh; background: #000;"></iframe>`;
         } else {
           mediaHtml = `<div class="p-5 text-secondary border border-dashed rounded">Invalid Google Drive Link</div>`;
         }
      } else {
         if (driveId) {
           mediaHtml = `<img src="https://lh3.googleusercontent.com/d/${driveId}" class="img-fluid rounded-3 shadow-sm" style="width:100%; object-fit:contain;" alt="${item.description}">`;
         } else {
           mediaHtml = `<img src="${item.url}" class="img-fluid rounded-3 shadow-sm" style="width:100%; object-fit:contain;" alt="${item.description}">`;
         }
      }

      const colClass = 'col-lg-4 col-md-6 col-12 mb-4';
      
      html += `
        <div class="${colClass}">
          <div class="skill-card p-3 p-md-4 text-center h-100 d-flex flex-column justify-content-center bg-white" style="border-radius: 12px; min-height: auto; cursor: default; transform: none; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            ${mediaHtml}
            <h6 class="mt-3 mb-0 fw-bold text-secondary">${item.description}</h6>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  function extractDriveId(url) {
    if (!url) return null;
    const match = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
    return match ? match[1] : null;
  }
});
