/* ===============================
   NAVBAR SCROLL
=============================== */
const navbar = document.getElementById("mainNavbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

/* ===============================
   MAGNETIC HOVER
=============================== */
const magneticItems = document.querySelectorAll(".magnetic-item");
magneticItems.forEach((item) => {
  item.addEventListener("mousemove", (event) => {
    if (window.innerWidth <= 991) return;
    const rect = item.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const moveX = (mouseX - centerX) * 0.22;
    const moveY = (mouseY - centerY) * 0.22;
    item.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
  item.addEventListener("mouseleave", () => {
    item.style.transform = "translate(0px, 0px)";
  });
});

/* ===============================
   SCROLL REVEAL (INTERSECTION OBSERVER)
=============================== */
document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal");
  const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("active");
      observer.unobserve(entry.target); 
    });
  }, revealOptions);
  reveals.forEach(reveal => {
    revealObserver.observe(reveal);
  });
});

/* ===============================
   SMART SEARCH
=============================== */
document.addEventListener("DOMContentLoaded", () => {
  const searchInputs = document.querySelectorAll(".glass-search");
  const searchResultsLists = document.querySelectorAll(".glass-search-results");
  
  if (searchInputs.length === 0) return;

  const searchData = [
    { title: "หน้าแรก (Home)", keywords: ["home", "หน้าแรก", "กลับหน้าแรก"], url: "index.html" },
    { title: "เกี่ยวกับฉัน (About)", keywords: ["about", "เกี่ยวกับ", "ประวัติ", "resume", "linkedin"], url: "about.html" },
    { title: "ติดต่อ (Contact)", keywords: ["contact", "ติดต่อ", "อีเมล", "เบอร์โทร", "email", "phone"], url: "contact.html" },
    { title: "ราคา & แพ็กเกจ (Pricing)", keywords: ["pricing", "ราคา", "แพ็กเกจ", "จ้าง", "service"], url: "pricing.html" },
    { title: "งานออกแบบกราฟิก (Graphic)", keywords: ["graphic", "กราฟิก", "ออกแบบ", "รูป", "ดีไซน์"], url: "work/graphic.html" },
    { title: "งานตัดต่อวิดีโอ (Video Editor)", keywords: ["video", "วิดีโอ", "ตัดต่อ", "คลิป", "reels", "tiktok", "youtube"], url: "work/editor.html" }
  ];

  searchInputs.forEach((searchInput, index) => {
    const searchResults = searchResultsLists[index];

    searchInput.addEventListener("input", function() {
      const query = this.value.toLowerCase().trim();
      searchResults.innerHTML = "";
      
      if (query.length === 0) {
        searchResults.classList.remove("show");
        return;
      }

      const matches = searchData.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.keywords.some(kw => kw.toLowerCase().includes(query))
      );

      if (matches.length > 0) {
        matches.forEach(match => {
          const a = document.createElement("a");
          let finalUrl = match.url;
          if (window.location.pathname.includes('/work/')) {
            if (match.url.startsWith('work/')) {
              finalUrl = match.url.replace('work/', '');
            } else {
              finalUrl = '../' + match.url;
            }
          }
          a.href = finalUrl;
          a.className = "search-result-item";
          a.textContent = match.title;
          searchResults.appendChild(a);
        });
      } else {
        const div = document.createElement("div");
        div.className = "search-result-item";
        div.textContent = "ไม่พบผลลัพธ์...";
        div.style.color = "#777";
        searchResults.appendChild(div);
      }

      searchResults.classList.add("show");
    });

    document.addEventListener("click", function(e) {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove("show");
      }
    });
  });
});

/* ===============================
   THEME NOTIFICATION LOGIC
=============================== */
function showThemeNotification(message) {
  let toastContainer = document.getElementById('theme-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'theme-toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '30px';
    toastContainer.style.left = '50%';
    toastContainer.style.transform = 'translateX(-50%)';
    toastContainer.style.zIndex = '9999';
    toastContainer.style.display = 'flex';
    toastContainer.style.flexDirection = 'column';
    toastContainer.style.alignItems = 'center';
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = 'theme-toast';
  toast.innerText = message;
  toastContainer.appendChild(toast);
  
  requestAnimationFrame(() => {
    setTimeout(() => toast.classList.add('show'), 10);
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ===============================
   DARK MODE TOGGLE & TOOLTIP
=============================== */
document.addEventListener("DOMContentLoaded", () => {
  const themeToggleBtns = document.querySelectorAll(".theme-toggle-btn");
  
  // Setup Tooltips for each button
  themeToggleBtns.forEach(btn => {
    const parentLi = btn.parentElement;
    parentLi.style.position = 'relative';
    
    const tooltip = document.createElement('div');
    tooltip.className = 'theme-tooltip pulse-anim';
    parentLi.appendChild(tooltip);
    
    btn.updateTooltip = function(theme) {
      if (theme === 'dark') {
        tooltip.innerText = "สามารถสลับไปเป็น Light Mode ได้แล้ว";
      } else {
        tooltip.innerText = "สามารถสลับไปเป็น Dark Mode ได้แล้ว";
      }
    };
    
    // Hide tooltip when user interacts
    btn.addEventListener("mouseenter", () => tooltip.classList.add("hide"));
    btn.addEventListener("click", () => tooltip.classList.add("hide"));
    
    // Auto hide after a while
    setTimeout(() => {
      tooltip.classList.add("hide");
    }, 7000);
  });

  // Initialize theme
  const currentTheme = localStorage.getItem("theme") || "light";
  if (currentTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
  
  // Update icons and tooltips on load (no notification)
  themeToggleBtns.forEach(btn => {
    btn.innerHTML = currentTheme === "dark" ? '☀️' : '🌙';
    btn.updateTooltip(currentTheme);
  });

  // Bind click event
  themeToggleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const newTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      
      // Update icons and tooltips
      themeToggleBtns.forEach(b => {
        b.innerHTML = newTheme === "dark" ? '☀️' : '🌙';
        b.updateTooltip(newTheme);
      });
      
      // Show Notification
      if (newTheme === "dark") {
        showThemeNotification("สลับ Dark Mode เรียบร้อยแล้ว");
      } else {
        showThemeNotification("สลับ Light Mode เรียบร้อยแล้ว");
      }
    });
  });
});

/* ===============================
   PRELOADER (TRUE LOAD)
=============================== */
document.body.classList.add("loading-state");
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add("fade-out");
      document.body.classList.remove("loading-state");
      setTimeout(() => {
        preloader.remove();
      }, 600);
    }, 300);
  } else {
    document.body.classList.remove("loading-state");
  }
});