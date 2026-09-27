/* ========================================
   封面 + 主页脚本
   ======================================== */

(function() {
  'use strict';

  // ==================== 封面 Canvas ====================
  var coverCanvas = document.getElementById('cover-canvas');
  var coverCtx = coverCanvas ? coverCanvas.getContext('2d') : null;
  var coverW, coverH;

  function resizeCover() {
    if (!coverCanvas) return;
    coverW = coverCanvas.width = window.innerWidth;
    coverH = coverCanvas.height = window.innerHeight;
  }
  resizeCover();
  window.addEventListener('resize', resizeCover);

  // ==================== 主页 Canvas ====================
  var mainCanvas = document.getElementById('main-canvas');
  var mainCtx = mainCanvas ? mainCanvas.getContext('2d') : null;
  var mainW, mainH;

  function resizeMain() {
    if (!mainCanvas) return;
    mainW = mainCanvas.width = window.innerWidth;
    mainH = mainCanvas.height = window.innerHeight;
  }
  resizeMain();
  window.addEventListener('resize', resizeMain);

  // ==================== 鼠标 ====================
  var mouse = { x: null, y: null, max: 18000 };

  document.addEventListener('mousemove', function(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseout', function() {
    mouse.x = null;
    mouse.y = null;
  });
  document.addEventListener('touchmove', function(e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }, { passive: true });
  document.addEventListener('touchend', function() {
    mouse.x = null;
    mouse.y = null;
  });

  // ==================== 粒子（封面） ====================
  var coverParticles = [];

  function createCoverParticles() {
    var count = coverW < 600 ? 30 : 50;
    coverParticles = [];
    for (var i = 0; i < count; i++) {
      coverParticles.push({
        x: Math.random() * coverW,
        y: Math.random() * coverH,
        xa: (Math.random() - 0.5) * 0.8,
        ya: (Math.random() - 0.5) * 0.8,
        max: 6000
      });
    }
  }
  createCoverParticles();

  // ==================== 粒子（主页） ====================
  var mainParticles = [];

  function createMainParticles() {
    var count = mainW < 600 ? 30 : 50;
    mainParticles = [];
    for (var i = 0; i < count; i++) {
      mainParticles.push({
        x: Math.random() * mainW,
        y: Math.random() * mainH,
        xa: (Math.random() - 0.5) * 0.8,
        ya: (Math.random() - 0.5) * 0.8,
        max: 6000
      });
    }
  }
  createMainParticles();

  // ==================== 四面体 ====================
  // ==================== 四面体 ====================
  var tetra = {};
  var MAX_DIST = 80;

  // ==================== 绘制粒子和连线（通用） ====================
  function drawParticles(ctx, particles, W, H) {
    var all = [mouse].concat(particles);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      p.x += p.xa;
      p.y += p.ya;
      if (p.x > W || p.x < 0) p.xa *= -1;
      if (p.y > H || p.y < 0) p.ya *= -1;

      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);

      for (var j = 0; j < all.length; j++) {
        var o = all[j];
        if (o === p || o.x === null) continue;
        var dx = p.x - o.x;
        var dy = p.y - o.y;
        var distSq = dx * dx + dy * dy;
        if (distSq < o.max) {
          if (o === mouse && distSq >= o.max / 2) {
            p.x -= 0.03 * dx;
            p.y -= 0.03 * dy;
          }
          var alpha = (o.max - distSq) / o.max;
          ctx.beginPath();
          ctx.lineWidth = alpha / 2;
          ctx.strokeStyle = 'rgba(0,217,255,' + (alpha + 0.2) + ')';
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(o.x, o.y);
          ctx.stroke();
        }
      }
      all.splice(all.indexOf(p), 1);
    }
  }

  // ==================== 绘制四面体（通用） ====================
  // 四面体已移除，改用粒子吸引圆环效果
  function drawTetrahedron(ctx, W, H) {
    // 空函数，保留以避免动画循环报错
  }

  // ==================== 封面动画循环 ====================
  function drawCoverFrame() {
    if (!coverCtx) return;
    coverCtx.clearRect(0, 0, coverW, coverH);
    drawParticles(coverCtx, coverParticles, coverW, coverH);
    requestAnimationFrame(drawCoverFrame);
  }

  // ==================== 主页动画循环 ====================
  function drawMainFrame() {
    if (!mainCtx) return;
    mainCtx.clearRect(0, 0, mainW, mainH);
    drawParticles(mainCtx, mainParticles, mainW, mainH);
    requestAnimationFrame(drawMainFrame);
  }

  mouse.x = window.innerWidth / 2;
  mouse.y = window.innerHeight / 2;

  window.addEventListener('resize', function() {
    createCoverParticles();
    createMainParticles();
  });

  drawCoverFrame();
  drawMainFrame();

  // ==================== 点击进入主页 ====================
  var bottomClickZone = document.getElementById('bottom-click-zone');
  var cover = document.getElementById('cover');
  var mainContent = document.getElementById('main-content');

  // 封面阶段隐藏滚动条
  document.body.classList.add('cover-mode');

  // 翻页动画：封面向下滑出，封面内的 canvas 跟着一起移走
  function goToMain() {
    document.body.classList.remove('cover-mode');
    cover.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
    cover.style.transform = 'translateY(-100%)';
    cover.style.opacity = '0';
    mainContent.style.display = 'block';
    mainContent.style.opacity = '0';
    mainContent.style.transition = 'opacity 0.8s ease 0.4s';
    mainContent.style.opacity = '1';
    window.scrollTo({ top: 0, behavior: 'instant' });
    showNavIndex();
    showHeader();
  }

  if (bottomClickZone) bottomClickZone.addEventListener('click', goToMain);

  // ==================== 顶部导航栏 ====================
  var siteHeader = document.getElementById('site-header');
  var headerNavLinks = document.querySelectorAll('.header-nav .nav-link');

  function showHeader() {
    if (siteHeader) siteHeader.classList.add('visible');
  }

  // 点击顶部导航链接：平滑滚动
  headerNavLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var targetId = link.getAttribute('href').substring(1);
      var target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // About 联系我链接：平滑滚动
  var aboutContactLink = document.querySelector('.about-contact-link');
  if (aboutContactLink) {
    aboutContactLink.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.getElementById('contact');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // ==================== 右侧导航索引 ====================
  var navIndex = document.getElementById('nav-index');
  var navItems = document.querySelectorAll('.nav-item');

  // 进主页时显示导航
  function showNavIndex() {
    if (navIndex) navIndex.classList.add('visible');
  }

  // 点击导航项：平滑滚动到对应 section
  navItems.forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      var targetId = item.getAttribute('href').substring(1);
      var target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 根据滚动位置计算当前 active section
  var sections = ['about', 'education', 'experience', 'projects', 'skills', 'contact'];
  var navItemMap = {};
  navItems.forEach(function(item) {
    navItemMap[item.getAttribute('data-section')] = item;
  });

  function updateActiveNav() {
    var scrollY = window.scrollY;
    var headerOffset = 56 + 40; // 导航高度 + 余量

    var closest = null;
    var closestDist = Infinity;

    sections.forEach(function(id) {
      var el = document.getElementById(id);
      if (!el) return;
      var top = el.offsetTop;
      var height = el.offsetHeight;
      // 计算section顶部在当前视口的位置，越接近0越靠前
      var dist = top - scrollY - headerOffset;

      // section在当前视口下方或附近
      if (dist >= 0 && dist < closestDist) {
        closestDist = dist;
        closest = id;
      }
    });

    // 如果没有找到（滚动到底部），使用最后一个section
    if (!closest && sections.length > 0) {
      closest = sections[sections.length - 1];
    }

    // 更新侧边导航
    navItems.forEach(function(item) { item.classList.remove('active'); });
    if (closest && navItemMap[closest]) navItemMap[closest].classList.add('active');
    // 更新顶部导航
    headerNavLinks.forEach(function(link) {
      link.classList.remove('active');
      if (link.getAttribute('data-section') === closest) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ==================== 核心课程标签 hover 高亮同类 ====================

  // ==================== 经历时间轴切换 ====================
  var timelineNodes = document.querySelectorAll('.timeline-node');
  var expPanels = document.querySelectorAll('.exp-panel');

  // 初始化结束年份
  timelineNodes.forEach(function(node) {
    var endYear = node.getAttribute('data-year-end');
    if (endYear) {
      var endSpan = document.createElement('span');
      endSpan.className = 'end-year';
      endSpan.textContent = endYear;
      node.appendChild(endSpan);
    }
  });

  timelineNodes.forEach(function(node) {
    node.addEventListener('click', function() {
      var target = node.getAttribute('data-exp');

      // 切换 timeline-node active 状态
      timelineNodes.forEach(function(n) { n.classList.remove('active'); });
      node.classList.add('active');

      // 切换 panel
      expPanels.forEach(function(panel) {
        if (panel.getAttribute('data-panel') === target) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // ==================== 项目 Modal ====================
  var modalOverlay = document.getElementById('modal-overlay');
  var modalClose = document.getElementById('modal-close');
  var modalTitle = document.getElementById('modal-title');
  var modalTime = document.getElementById('modal-time');
  var modalDesc = document.getElementById('modal-desc');
  var modalTags = document.getElementById('modal-tags');
  var modalDetails = document.getElementById('modal-details');

  var projectData = {
    windowed_translator: {
      time: '2025',
      title: 'Windowed Translator',
      desc: '截图 OCR + 多引擎翻译工具，支持 DeepL/百度/ChatGPT 三大翻译引擎，提供快捷的全局快捷键操作。',
      tags: ['tkinter', 'OCR', 'AI翻译', 'PIL', 'DeepL API', 'Baidu API', 'OpenAI API', '热键'],
      details: [
        '截图识别：自定义窗口大小、透明背景、随时显示/隐藏',
        '多引擎切换：支持 DeepL Pro、百度翻译、OpenAI GPT 三种翻译后端',
        'API 配置管理：独立的设置界面，支持多组 API 密钥管理',
        '热键支持：V 切换显示、F 开始识别翻译、Q 调整透明度、Alt+G 打开配置',
        'DPI 适配：支持系统 DPI 设置，确保高分辨率屏幕下显示清晰',
        '日志系统：完整的错误日志记录，方便排查问题'
      ]
    },
    gobang: {
      time: '2024',
      title: 'GoBang',
      desc: '基于 Pygame 的五子棋游戏，支持人机对战、本地双人和在线匹配三种模式。',
      tags: ['Pygame', 'Python', 'UDP', 'IPv6', '状态机'],
      details: [
        '三种游戏模式：单人（简单AI）、本地双人、在线匹配',
        '状态机设计：菜单→设置→游戏→结算，清晰的状态流转',
        '在线对战：基于 IPv6 UDP 的 P2P 通信，自动寻找对手',
        '设置保存：游戏分辨率等设置持久化到本地文件',
        '悔棋功能：支持在本地游戏中撤回上一步',
        '帧率监控：实时显示端口号、FPS、帧时间、延迟等调试信息'
      ]
    },
    inotia4: {
      time: '2025',
      title: 'Lib Reverse Analysis',
      desc: 'C++ 库文件逆向分析，还原加密算法，解析二进制数据结构',
      tags: ['逆向工程', 'Ghidra', 'C/C++', '汇编', '加密算法'],
      details: [
        '逆向分析 so 库（libgame.so），理解游戏存档加密逻辑',
        '还原 XOR + keypool + ID掩码 的自定义加密算法',
        '解析二进制存档结构：角色属性、物品栏、gem效果等',
        '实现存档数据的读取、修改、加密回写',
        '分析 item 结构的位字段：类型、数量、效果值、随机数',
        '时间戳与索引的生成规则：每分钟 2^22 个 ID 空间'
      ]
    },
    custom_stl: {
      time: '2024',
      title: 'Custom STL Container',
      desc: 'C++ 手写红黑树、vector、hashset，内存池优化，某些场景比 STL 快数倍',
      tags: ['C/C++', '数据结构', '内存优化', '红黑树', '哈希表'],
      details: [
        'rbtree：红黑树实现，支持 unique/multiset 两种模式，节点内存池复用',
        'vector：动态数组，容量自动扩容/缩容，迭代器支持',
        'hashset：仿 Python set 的哈希集合，线性探测+dummy 标记解决删除问题',
        'intersect 操作：hashset 交集运算，优化遍历顺序减少探测次数',
        '内存池优化：删除节点回收至 bin 数组复用，省去频繁堆分配',
        '自定义比较器：支持任意类型 key 和自定义比较函数'
      ]
    },
    socket: {
      time: '2023',
      title: 'Socket Chat',
      desc: '基于 IPv6 TCP 的局域网聊天室，支持公聊、私聊和文件传输功能。',
      tags: ['TCP', 'IPv6', 'tkinter', '文件传输', 'Socket'],
      details: [
        'TCP 连接：基于 IPv6 的可靠传输，支持内网穿透',
        '消息类型：公聊消息、私聊消息、系统通知三种消息',
        '文件传输：独立的文件传输协议，支持大文件（>200MB）传输',
        'UI 美化：不同类型消息用不同颜色区分（蓝色自己、紫色私聊、灰色系统）',
        '断线重连：支持网络断开后重新连接',
        '实时预览：文件传输列表，支持刷新和下载'
      ]
    },
    predict: {
      time: '2024 · 课程项目',
      title: '房价预测系统',
      desc: 'Flask Web 应用结合机器学习模型，实现房价预测与回测功能。',
      tags: ['Flask', 'Python', '机器学习', 'Web', 'HTML/CSS'],
      details: [
        'Web 界面：使用 Flask 框架，前端 HTML/CSS/JS 实现',
        '用户管理：支持管理员登录、注册、权限管理',
        '模型训练：后台自动训练和更新预测模型',
        '参数可视化：在线查看和修改模型参数',
        '回测功能：根据历史数据回测模型表现',
        '数据集管理：支持管理员对数据集的维护和更新'
      ]
    },
    stockview: {
      time: '2024 · 课程项目',
      title: '股票模拟交易系统',
      desc: 'UDP IPv6 股票交易模拟系统，多页面 GUI 展示实时行情和交易功能。',
      tags: ['tkinter', 'UDP', 'IPv6', '股票', 'GUI', '多页面'],
      details: [
        '多页面架构：行情、资讯、用户信息、自选、模拟交易、登录六大页面',
        '实时行情：支持沪深京A/B股及指数的实时价格展示',
        '技术指标：分时图、五档买卖盘口、涨跌颜色提示',
        '交易功能：买入/卖出委托、市价/限价单、持仓管理',
        '用户系统：注册登录、资金管理、交易历史查询',
        '搜索功能：股票代码联想搜索，自选股管理'
      ]
    }
  };

  function openModal(projectId) {
    var data = projectData[projectId];
    if (!data) return;

    modalTitle.textContent = data.title;
    modalTime.textContent = data.time;
    modalDesc.textContent = data.desc;

    modalTags.innerHTML = '';
    data.tags.forEach(function(tag) {
      var span = document.createElement('span');
      span.className = 'modal-tag';
      span.textContent = tag;
      modalTags.appendChild(span);
    });

    modalDetails.innerHTML = '<h3>核心功能</h3><ul>';
    data.details.forEach(function(detail) {
      modalDetails.innerHTML += '<li>' + detail + '</li>';
    });
    modalDetails.innerHTML += '</ul>';

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.project-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var projectId = item.getAttribute('data-project');
      openModal(projectId);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  var eduTags = document.querySelectorAll('.edu-core-tags .edu-tag');

  // ==================== 兴趣爱好标签提示气泡 ====================
  var interestTags = document.querySelectorAll('.about-interest');

  interestTags.forEach(function(tag) {
    var tooltip = null;

    tag.addEventListener('mouseenter', function() {
      var text = tag.getAttribute('data-tip');
      if (!text) return;

      tooltip = document.createElement('div');
      tooltip.className = 'about-interest-tooltip';
      tooltip.innerHTML = text.replace(/\n/g, '<br>');
      tag.appendChild(tooltip);

      requestAnimationFrame(function() {
        tooltip.classList.add('visible');
      });
    });

    tag.addEventListener('mouseleave', function() {
      if (tooltip) {
        tooltip.classList.remove('visible');
        setTimeout(function() {
          if (tooltip && tooltip.parentNode === tag) {
            tag.removeChild(tooltip);
          }
        }, 200);
        tooltip = null;
      }
    });

    // 移动端点击支持
    tag.addEventListener('click', function(e) {
      // 关闭其他已打开的提示
      interestTags.forEach(function(otherTag) {
        if (otherTag !== tag) {
          var existingTooltip = otherTag.querySelector('.about-interest-tooltip');
          if (existingTooltip) {
            existingTooltip.classList.remove('visible');
            setTimeout(function() {
              if (existingTooltip.parentNode === otherTag) {
                otherTag.removeChild(existingTooltip);
              }
            }, 200);
          }
        }
      });

      var text = tag.getAttribute('data-tip');
      if (!text) return;

      if (tooltip) {
        tooltip.classList.remove('visible');
        setTimeout(function() {
          if (tooltip && tooltip.parentNode === tag) {
            tag.removeChild(tooltip);
          }
        }, 200);
        tooltip = null;
      } else {
        tooltip = document.createElement('div');
        tooltip.className = 'about-interest-tooltip';
        tooltip.innerHTML = text.replace(/\n/g, '<br>');
        tag.appendChild(tooltip);

        requestAnimationFrame(function() {
          tooltip.classList.add('visible');
        });
      }
    });
  });

  eduTags.forEach(function(tag) {
    tag.addEventListener('mouseenter', function() {
      var category = tag.getAttribute('data-category');
      eduTags.forEach(function(t) {
        if (t.getAttribute('data-category') === category) {
          t.classList.add('highlight');
        }
      });
    });

    tag.addEventListener('mouseleave', function() {
      eduTags.forEach(function(t) { t.classList.remove('highlight'); });
    });
  });

  // ==================== 滚动揭示动画 ====================
  function initReveal() {
    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // 技能条动画：设置目标宽度
          var skillBars = entry.target.querySelectorAll('.skill-bar-fill[data-width]');
          skillBars.forEach(function(bar) {
            bar.style.width = bar.dataset.width + '%';
          });
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    // 观察所有 .reveal 元素
    document.querySelectorAll('.reveal').forEach(function(el) {
      revealObserver.observe(el);
    });

    return revealObserver;
  }

  // ==================== 数字滚动动画 ====================
  function initCountUp() {
    var stats = document.querySelectorAll('[data-count]');
    if (!stats.length) return;

    var countObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseFloat(el.dataset.count);
        var decimals = parseInt(el.dataset.decimals || '0', 10);
        var suffix = el.dataset.suffix || '';
        var dur = 1400;
        var start = performance.now();

        function step(now) {
          var t = Math.min(1, (now - start) / dur);
          // 缓动函数：ease-out cubic
          var eased = 1 - Math.pow(1 - t, 3);
          var v = target * eased;
          el.innerHTML = v.toFixed(decimals) + suffix + (el.querySelector('small') ? el.querySelector('small').outerHTML : '');
          if (t < 1) {
            requestAnimationFrame(step);
          } else {
            el.innerHTML = target.toFixed(decimals) + suffix + (el.querySelector('small') ? el.querySelector('small').outerHTML : '');
          }
        }
        requestAnimationFrame(step);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    stats.forEach(function(stat) {
      countObserver.observe(stat);
    });
  }

  // ==================== 初始化 ====================
  initReveal();
  initCountUp();

})();
