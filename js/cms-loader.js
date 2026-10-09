document.addEventListener("DOMContentLoaded", () => {
  const videoContainer = document.getElementById("cms-video-container");
  const graphicContainer = document.getElementById("cms-graphic-container");

  if (videoContainer || graphicContainer) {
    const jsonUrl = window.location.pathname.includes('/work/') ? '../data/database.json' : 'data/database.json';
    
    fetch(jsonUrl + "?t=" + new Date().getTime())
      .then(res => res.json())
      .then(data => {
        const projects = data.projects || [];
        
        if (videoContainer) {
          const videoProjects = projects.filter(p => p.category === "Video Editor");
          renderProjects(videoProjects, videoContainer, 'video');
        }
        
        if (graphicContainer) {
          const graphicProjects = projects.filter(p => p.category === "Graphic Design");
          renderProjects(graphicProjects, graphicContainer, 'image');
        }
      })
      .catch(err => {
        console.error("Error loading CMS data:", err);
        if (videoContainer) videoContainer.innerHTML = '<div class="text-center text-danger">Failed to load projects.</div>';
        if (graphicContainer) graphicContainer.innerHTML = '<div class="text-center text-danger">Failed to load projects.</div>';
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

      html += `
        <div class="accordion-item mb-4" style="border-radius: 12px; border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px);">
          <h2 class="accordion-header" id="${headingId}">
            <button class="accordion-button ${isFirst ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${isFirst ? 'true' : 'false'}" aria-controls="${collapseId}" style="font-size: 1.25rem; font-weight: 600; color: #111; padding: 1.5rem; background-color: transparent; box-shadow: none;">
              ${project.title}
            </button>
          </h2>
          <div id="${collapseId}" class="accordion-collapse collapse ${isFirst ? 'show' : ''}" aria-labelledby="${headingId}" data-bs-parent="#${accordionId}">
            <div class="accordion-body" style="padding: 2rem 1.5rem;">
              <div class="row justify-content-center">
      `;

      const items = project.items || [];
      items.forEach(item => {
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
                  <div class="skill-card p-3 p-md-4 text-center h-100 d-flex flex-column justify-content-center bg-white" style="border-radius: 12px; min-height: auto; cursor: default; transform: none; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
                    ${mediaHtml}
                    <h6 class="mt-3 mb-0 fw-bold text-secondary">${item.description}</h6>
                  </div>
                </div>
        `;
      });

      html += `
              </div>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    container.innerHTML = html;

    // เพิ่มระบบเลื่อนหน้าจอ (Scroll) อัตโนมัติเมื่อกดเปิด Accordion
    const collapseElements = container.querySelectorAll('.accordion-collapse');
    collapseElements.forEach(el => {
      el.addEventListener('shown.bs.collapse', function (e) {
        const header = e.target.previousElementSibling;
        const headerOffset = header.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: headerOffset - 100, // เผื่อพื้นที่ให้ Navbar ด้านบน (ปรับตัวเลข 100 ได้ถ้า navbar บัง)
          behavior: 'smooth'
        });
      });
    });
  }

  function extractDriveId(url) {
    if (!url) return null;
    const match = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
    return match ? match[1] : null;
  }
});
