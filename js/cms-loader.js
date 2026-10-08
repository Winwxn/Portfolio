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

    let html = '';
    
    projects.forEach(project => {
      html += `
      <section class="container mb-5 reveal active">
        <div class="row justify-content-center">
          <div class="col-12 text-center mb-4">
            <div class="project-header">
              <h4 class="mb-0 fw-bold" style="color: #111;">${project.title}</h4>
            </div>
          </div>
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
             mediaHtml = `<img src="https://drive.google.com/uc?export=view&id=${driveId}" class="img-fluid rounded-3 shadow-sm" style="width:100%; object-fit:contain;" alt="${item.description}">`;
           } else {
             mediaHtml = `<img src="${item.url}" class="img-fluid rounded-3 shadow-sm" style="width:100%; object-fit:contain;" alt="${item.description}">`;
           }
        }

        const colClass = 'col-lg-4 col-md-6 col-12 mb-4';
        
        html += `
          <div class="${colClass}">
            <div class="skill-card p-3 p-md-4 text-center h-100 d-flex flex-column justify-content-center" style="min-height: auto; cursor: default; transform: none;">
              ${mediaHtml}
              <h6 class="mt-3 mb-0 fw-bold text-secondary">${item.description}</h6>
            </div>
          </div>
        `;
      });

      html += `
        </div>
      </section>
      `;
    });

    container.innerHTML = html;
  }

  function extractDriveId(url) {
    if (!url) return null;
    const match = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
    return match ? match[1] : null;
  }
});
