/* ============================================================
 * 麦抢 · 演示数据（全部为虚构模拟数据，不对接真实票务平台）
 * ============================================================ */

// 演示用海报生成地址
function IMG(prompt, size) {
  return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt='
    + encodeURIComponent(prompt) + '&image_size=' + (size || 'landscape_4_3');
}

const CATEGORIES = [
  { icon: '🎤', name: '演唱会' },
  { icon: '🎸', name: '音乐节' },
  { icon: '🎭', name: '话剧音乐剧' },
  { icon: '🏀', name: '体育赛事' },
  { icon: '🖼️', name: '展览休闲' }
];

const BANNERS = [
  {
    title: '星河流转巡回演唱会 · 上海站',
    img: IMG('演唱会宣传海报，璀璨星河舞台，歌手剪影，红色灯光，人海荧光棒，电影质感', 'landscape_16_9')
  },
  {
    title: '热浪音乐节 国庆开躁',
    img: IMG('户外音乐节海报，夕阳草地舞台，年轻人狂欢，彩色灯光，活力氛围', 'landscape_16_9')
  },
  {
    title: '脱口秀《笑到最后》爆笑来袭',
    img: IMG('脱口秀喜剧演出海报，暖色聚光灯，麦克风，欢乐氛围，简约现代设计', 'landscape_16_9')
  }
];

/* stock: lots 充足 / few 紧张 / none 售罄
 * status: onsale 在售中 / upcoming 即将开售（saleIn 为距当前秒数，动态生成开售时间） */
const EVENTS = [
  {
    id: 'e1',
    title: '「星河流转」2026 巡回演唱会 · 上海站',
    cate: '演唱会',
    cover: IMG('流行演唱会现场，星河主题舞台，蓝色灯光，万人荧光棒海洋'),
    poster: IMG('演唱会竖版海报，星空银河，歌手舞台剪影，红蓝色调，高级质感', 'portrait_4_3'),
    venue: '上海 · 梅赛德斯-奔驰文化中心',
    date: '2026.10.18 周日 19:30',
    score: '9.6 分',
    want: '23.6 万人想看',
    status: 'onsale',
    sessions: [
      { id: 's1', name: '2026.10.18 周日 19:30', sub: '上海站 · 第一场' },
      { id: 's2', name: '2026.10.19 周一 19:30', sub: '上海站 · 第二场（加场）' }
    ],
    prices: [
      { id: 'p1', price: 380, label: '看台票', stock: 'none' },
      { id: 'p2', price: 580, label: '看台票', stock: 'few' },
      { id: 'p3', price: 880, label: '内场票', stock: 'lots' },
      { id: 'p4', price: 1280, label: '内场票', stock: 'lots' },
      { id: 'p5', price: 1680, label: 'VIP 票', stock: 'few' },
      { id: 'p6', price: 1880, label: '至尊 VIP', stock: 'lots' }
    ],
    notice: '本场演出实行实名制购票，一票一证，购票人与观演人需一致。每个账号限购 4 张。门票一经售出不退不换，请谨慎购买。1.2 米以上儿童需持票入场。'
  },
  {
    id: 'e2',
    title: '热浪音乐节 · 上海站（国庆场）',
    cate: '音乐节',
    cover: IMG('户外音乐节，白天草地舞台，彩色旗帜，年轻人群，夏日活力'),
    poster: IMG('音乐节竖版海报，热浪橙红色调，舞台烟花，人群剪影，潮流设计', 'portrait_4_3'),
    venue: '上海 · 森兰绿地公园',
    date: '2026.10.03 - 10.04',
    score: '9.2 分',
    want: '11.8 万人想看',
    status: 'upcoming',
    saleIn: 90, // 演示：约 1 分半后开售
    sessions: [
      { id: 's1', name: '10.03 单日票', sub: '阵容：20+ 组乐队' },
      { id: 's2', name: '10.04 单日票', sub: '阵容：压轴神秘嘉宾' },
      { id: 's3', name: '双日通票', sub: '两天不限次进出' }
    ],
    prices: [
      { id: 'p1', price: 480, label: '早鸟单日票', stock: 'lots' },
      { id: 'p2', price: 680, label: '普通单日票', stock: 'lots' },
      { id: 'p3', price: 980, label: 'VIP 单日票', stock: 'few' },
      { id: 'p4', price: 1280, label: '双日通票', stock: 'none' }
    ],
    notice: '音乐节为户外站立观演，建议穿着舒适鞋服。门票实名制，每个账号限购 2 张。如遇不可抗力（天气等）导致演出延期或取消，将统一安排退票。'
  },
  {
    id: 'e3',
    title: '话剧《深夜书房》上海驻演',
    cate: '话剧音乐剧',
    cover: IMG('话剧舞台，暖黄色书房布景，暖光台灯，文艺安静氛围'),
    poster: IMG('话剧竖版海报，深夜书房，暖黄灯光，书架，悬疑文艺风格', 'portrait_4_3'),
    venue: '上海 · 上海大剧院 · 中剧场',
    date: '2026.09.25 周五 19:15',
    score: '9.4 分',
    want: '3.2 万人想看',
    status: 'onsale',
    sessions: [
      { id: 's1', name: '2026.09.25 周五 19:15', sub: '驻演第 48 场' },
      { id: 's2', name: '2026.09.26 周六 14:00', sub: '午场' }
    ],
    prices: [
      { id: 'p1', price: 180, label: '二楼票', stock: 'lots' },
      { id: 'p2', price: 280, label: '一楼票', stock: 'lots' },
      { id: 'p3', price: 380, label: '一楼池座', stock: 'few' },
      { id: 'p4', price: 680, label: 'VIP 池座', stock: 'none' }
    ],
    notice: '话剧演出时长约 120 分钟（含 15 分钟中场休息）。1.2 米以下儿童谢绝入场。演出开始后谢绝拍照录像，请提前 30 分钟到场检票。'
  },
  {
    id: 'e4',
    title: 'CBA 常规赛：上海鲨鱼 vs 北京首钢',
    cate: '体育赛事',
    cover: IMG('篮球比赛现场，激烈对抗，球场灯光，观众欢呼，运动摄影'),
    poster: IMG('篮球赛事竖版海报，篮球扣篮剪影，红蓝对决色调，动感设计', 'portrait_4_3'),
    venue: '上海 · 东方体育中心',
    date: '2026.09.20 周日 19:35',
    score: '9.0 分',
    want: '5.6 万人想看',
    status: 'onsale',
    sessions: [
      { id: 's1', name: '2026.09.20 周日 19:35', sub: '常规赛第 2 轮' }
    ],
    prices: [
      { id: 'p1', price: 100, label: '山顶票', stock: 'lots' },
      { id: 'p2', price: 200, label: '下层看台', stock: 'lots' },
      { id: 'p3', price: 400, label: '中层看台', stock: 'few' },
      { id: 'p4', price: 880, label: '内场前排', stock: 'lots' }
    ],
    notice: '体育赛事门票实名制，每个账号限购 6 张。观赛请遵守场馆安保规定，禁止携带专业相机、荧光棒及外带食品饮料。'
  },
  {
    id: 'e5',
    title: '霓虹电子之夜 Neon Rave 电音派对',
    cate: '演唱会',
    cover: IMG('电子音乐派对现场，霓虹灯光，DJ台，紫色蓝色激光，人群跳跃'),
    poster: IMG('电音派对竖版海报，赛博朋克霓虹，DJ耳机，紫粉激光，潮流风格', 'portrait_4_3'),
    venue: '上海 · MAO Livehouse',
    date: '2026.11.07 周六 20:00',
    score: '8.9 分',
    want: '1.9 万人想看',
    status: 'upcoming',
    saleIn: 1800, // 演示：30 分钟后开售
    sessions: [
      { id: 's1', name: '2026.11.07 周六 20:00', sub: '通宵场至次日 02:00' }
    ],
    prices: [
      { id: 'p1', price: 199, label: '早鸟票', stock: 'lots' },
      { id: 'p2', price: 299, label: '普通票', stock: 'lots' },
      { id: 'p3', price: 399, label: 'VIP 票', stock: 'few' }
    ],
    notice: '电音派对为站立观演，现场音量较大，可自备耳塞。未成年人谢绝入场。门票实名制，售出不退。'
  },
  {
    id: 'e6',
    title: '城市爱乐乐团 · 秋日交响音乐会',
    cate: '话剧音乐剧',
    cover: IMG('交响音乐会现场，金色大厅，乐团演奏，暖黄灯光，典雅庄重'),
    poster: IMG('交响音乐会竖版海报，金色音乐厅，指挥棒与小提琴，典雅金色设计', 'portrait_4_3'),
    venue: '上海 · 上海交响乐团音乐厅',
    date: '2026.10.12 周一 19:30',
    score: '9.5 分',
    want: '1.1 万人想看',
    status: 'onsale',
    sessions: [
      { id: 's1', name: '2026.10.12 周一 19:30', sub: '勃拉姆斯专场' }
    ],
    prices: [
      { id: 'p1', price: 120, label: '楼厅票', stock: 'lots' },
      { id: 'p2', price: 220, label: '池座后排', stock: 'lots' },
      { id: 'p3', price: 380, label: '池座前排', stock: 'lots' },
      { id: 'p4', price: 580, label: 'VIP 席', stock: 'few' }
    ],
    notice: '音乐会时长约 100 分钟。1 米以下儿童谢绝入场（儿童场除外）。乐章之间请勿鼓掌，全程请将手机调至静音。'
  },
  {
    id: 'e7',
    title: '脱口秀《笑到最后》全国巡演 · 上海站',
    cate: '演唱会',
    cover: IMG('脱口秀现场，单口喜剧演员持麦表演，暖色聚光灯，观众欢笑'),
    poster: IMG('脱口秀竖版海报，红色幕布麦克风，喜剧笑脸元素，红黄喜庆设计', 'portrait_4_3'),
    venue: '上海 · 上海文化广场',
    date: '2026.10.01 周四 19:30',
    score: '9.3 分',
    want: '8.4 万人想看',
    status: 'onsale',
    sessions: [
      { id: 's1', name: '2026.10.01 周四 19:30', sub: '国庆特别场' },
      { id: 's2', name: '2026.10.02 周五 19:30', sub: '常规场' }
    ],
    prices: [
      { id: 'p1', price: 180, label: '二楼票', stock: 'none' },
      { id: 'p2', price: 280, label: '一楼票', stock: 'few' },
      { id: 'p3', price: 480, label: '池座票', stock: 'lots' },
      { id: 'p4', price: 680, label: 'VIP 前排', stock: 'lots' }
    ],
    notice: '演出时长约 90 分钟，16 岁以下观众不建议入场。演出期间禁止录音录像、直播，禁止携带饮料食品入场。'
  },
  {
    id: 'e8',
    title: '沉浸式光影艺术展《宇宙回响》',
    cate: '展览休闲',
    cover: IMG('沉浸式光影艺术展，宇宙星空投影，人物剪影，梦幻蓝紫色光效'),
    poster: IMG('艺术展竖版海报，宇宙星球光影，沉浸式投影空间，梦幻蓝紫色调', 'portrait_4_3'),
    venue: '上海 · 上海当代艺术博物馆',
    date: '2026.09.15 - 11.30 每日 10:00-21:00',
    score: '9.1 分',
    want: '4.7 万人想看',
    status: 'onsale',
    sessions: [
      { id: 's1', name: '展期内任意一日', sub: '10:00-21:00（20:00 停止入场）' }
    ],
    prices: [
      { id: 'p1', price: 99, label: '工作日单人票', stock: 'lots' },
      { id: 'p2', price: 139, label: '通用单人票', stock: 'lots' },
      { id: 'p3', price: 199, label: '双人同行票', stock: 'lots' }
    ],
    notice: '展票无需选定具体日期，展期内任选一天使用。沉浸式展厅光线较暗，请注意脚下安全。门票单次有效，出场后不可重复入场。'
  }
];

// 开售时间：upcoming 场次在数据加载时动态生成，保证倒计时可体验
EVENTS.forEach(ev => {
  if (ev.status === 'upcoming') ev.saleAt = Date.now() + ev.saleIn * 1000;
});
