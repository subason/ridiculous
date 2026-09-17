import { Component, ElementRef, AfterViewInit, OnDestroy, QueryList, ViewChildren, ViewChild, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { MetricCardData } from './dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('tileCanvas') tileCanvases!: QueryList<ElementRef<HTMLCanvasElement>>;
  @ViewChild('drawerCanvas') drawerCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('confettiCanvas') confettiCanvas?: ElementRef<HTMLCanvasElement>;
  
  // Bottom Dark Section Canvas References
  @ViewChild('radarCanvas') radarCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('snackBreakdownCanvas') snackBreakdownCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('energyDecayCanvas') energyDecayCanvas?: ElementRef<HTMLCanvasElement>;

  scrollProgress = signal<number>(0);
  activeMember = signal<MetricCardData | null>(null);
  isDarkMode = signal<boolean>(false); // Default Light Mode
  isCrazyMode = signal<boolean>(true); // Default CRAZY MODE active!

  // Competition Judges & Scoring HUD State
  judgeScore = signal<number>(98);
  judgeCategory = signal<string>('BEST CORPORATE SATIRE 2026');
  likeCount = signal<number>(9420);
  screenShaking = signal<boolean>(false);

  // 🚨 Boss Panic / Stealth Mode
  isStealthMode = signal<boolean>(false);

  // 🔊 Audio Engine State
  soundEnabled = signal<boolean>(true);
  private audioCtx: AudioContext | null = null;

  // 🎡 Spin the Wheel Generator State
  isWheelOpen = signal<boolean>(false);
  isSpinning = signal<boolean>(false);
  selectedExcuse = signal<string>('Click SPIN THE WHEEL to generate a bulletproof office excuse!');
  excuseList: string[] = [
    "🫥 'My WiFi router is experiencing spiritual fatigue after today's sprint planning.'",
    "🍕 'Alex stole my Chobani yogurt from the 3rd floor fridge, currently filing HR arbitration.'",
    "☕ 'Stuck in a 4-hour sync meeting about how to reduce sync meetings.'",
    "💀 'Per my last email: I have transcended beyond Slack status updates.'",
    "💥 'Dev Patel's mechanical keyboard smashed through sound barrier, ears bleeding.'",
    "☕ 'Morning Filter Coffee stock expired, team velocity dropped to zero.'",
    "💻 'My laptop webcam only resolves photons in the 9th dimension.'",
    "🚗 'Stuck in Silk Board traffic since yesterday 6 PM, sending PR from auto.'",
    "🚀 'I wrote a 14-page cloud RFC purely using 💀 🚢 🧱 emojis.'",
    "🤐 'I am on mute because my neighbor is testing 120dB bass speakers.'",
    "🧹 'Sweeper cleared my desktop cache along with office dust.'",
    "📊 'A waiting for B, B waiting for C, C is taking tea break.'"
  ];

  // 👥 Add Custom Teammate Form State
  isAddMemberOpen = signal<boolean>(false);
  newMemberName = signal<string>('');
  newMemberRole = signal<string>('');
  newMemberAvatar = signal<string>('🥷');
  newMemberKpiTitle = signal<string>('Chai Break Velocity');
  newMemberKpiMetric = signal<number>(4.8);
  newMemberKpiUnit = signal<string>('cups / hr');
  newMemberBadge = signal<string>('Certified Legend');

  // Dynamic Ticker Counters
  snackCount = signal<number>(4841);
  emailCount = signal<number>(341);
  keyboardSmashed = signal<number>(14);
  webcamExcuseCount = signal<number>(419);

  // Crazy Breaking News Banner (Tamil + English Office Jokes)
  latestNewsIndex = signal<number>(0);
  tickerNews = [
    "🚨 BREAKING: Alex Chen devoured 3 donuts in 4.2 seconds during Sprint Planning!",
    "💥 Dev Patel's spacebar entered low Earth orbit (seismic magnitude 2.4 detected)!",
    "🫥 Marcus's camera excuse #419: 'My bandwidth is experiencing spiritual fatigue'.",
    "☕ Priya sent 'Hope this helps!' — 4 team leads immediately went into hiding!",
    "💀 Sarah scheduled a 45-minute sync meeting to discuss how to have fewer meetings!",
    "🚀 Luna responded to CEO's strategy email with 💀🚢🧱🚀 — pitch approved unanimously!",
    "☕ Morning Filter Coffee budget approved by CEO — productivity increased by +900%!",
    "🚗 Teammate stuck in Silk Board traffic sent 14 PRs using mobile hotspot!",
    "🍕 Emergency Samosa raid in progress on 4th floor pantry!"
  ];

  toastMessage = signal<string | null>(null);

  // Search & Filter Signals
  searchQuery = signal<string>('');
  selectedMemberId = signal<string>('all');

  private tileChartInstances: Chart[] = [];
  private drawerChartInstance: Chart | null = null;
  private bottomChartInstances: Chart[] = [];
  private newsInterval: any;
  private chaosInterval: any;

  membersList = signal<MetricCardData[]>([
    {
      id: 'alex', name: 'Alex Chen', role: 'VP of Pantry Raider Ops', avatar: '🍕',
      rankBadge: 'Snack Legend', themeClass: 'card-alex', kpiTitle: 'Snack Consumption Velocity',
      kpiMetric: 4841, kpiUnit: 'snacks / hr', changeText: '↑ +492%',
      footerLeft: 'Target: 4.0 (Exceeded +492%)', footerCta: 'Raid Snack',
      tileChartType: 'doughnut', tileChartLabels: ['Chips', 'Cookies', 'Coffee', 'Others'],
      tileChartValues: [32, 24, 18, 26], tileColors: ['#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6'],
      legendItems: [
        { label: 'Chips', percent: '32%', color: '#3b82f6' },
        { label: 'Cookies', percent: '24%', color: '#ec4899' },
        { label: 'Coffee', percent: '18%', color: '#f59e0b' },
        { label: 'Others', percent: '26%', color: '#8b5cf6' }
      ],
      stats: [{ label: 'Peak Hour', value: '2:42 PM' }, { label: 'Stolen Chobani', value: '148' }, { label: 'Mute Chewing', value: '99.8%' }],
      drillChartType: 'bar', drillChartLabels: ['Doritos', 'Cold Pizza', 'Donuts', 'Coffee (Raw)'], drillChartValues: [420, 680, 520, 95],
      insights: ["Whispered: 'These macaroons belong to the proletariat.'", "Granola unwrap signature is below 2.1 dB during calls."],
      votes: 42
    },
    {
      id: 'priya', name: 'Priya Nair', role: 'Staff Diplomacy Eng', avatar: '☕',
      rankBadge: 'DEFCON 2 Sarcasm', themeClass: 'card-priya', kpiTitle: 'Passive Aggression Quotient',
      kpiMetric: 9.8, kpiUnit: '/ 10 polite threat', changeText: '↑ +38%',
      footerLeft: 'Escalated to 14 managers', footerCta: 'Email',
      customWidget: 'bars', tileChartType: 'bar', tileChartLabels: ['Emails', 'Chats', 'Meetings', 'Slack', 'Face'],
      tileChartValues: [8.1, 9.3, 10.0, 9.7, 9.2], tileColors: ['#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981'],
      stats: [{ label: 'Ellipses (...)', value: '1,209' }, { label: 'Client Tears', value: '14.2 L' }, { label: 'Kind Regards', value: '84' }],
      drillChartType: 'radar', drillChartLabels: ['Politeness', 'Subtext Threat', 'Ellipses', 'Response Speed', 'Intimidation'], drillChartValues: [95, 98, 88, 100, 92],
      insights: ["'Hope this helps!' was classified as psychological warfare.", "Replies in 32 seconds to emails from 4 weeks ago."],
      votes: 38
    },
    {
      id: 'marcus', name: 'Marcus Williams', role: 'Principal Ghost Eng', avatar: '🫥',
      rankBadge: 'Cam Blackout 340d', themeClass: 'card-marcus', kpiTitle: 'Webcam Excuse Innovation',
      kpiMetric: 98.2, kpiUnit: 'Novelty Score', changeText: '↑ +76%',
      footerLeft: 'Latest: "WiFi cannot resolve my issue"', footerCta: 'Excuse',
      customWidget: 'segments', tileChartType: 'radar', tileChartLabels: ['WiFi Glitch', 'Dark Room', 'Pet Alert', 'Aura Check', 'Paradox'],
      tileChartValues: [95, 88, 92, 100, 85], tileColors: ['#8b5cf6', '#ec4899', '#3b82f6', '#06b6d4', '#10b981'],
      stats: [{ label: 'Days Video Off', value: '341' }, { label: 'Avatar Blinks', value: '0' }, { label: 'Fake Glitches', value: '419' }],
      drillChartType: 'doughnut', drillChartLabels: ['Bandwidth Glitch', 'Light Calibrating', 'Puppy in Lap', 'Paradox'], drillChartValues: [40, 25, 20, 15],
      insights: ["Maintains camera only resolves photons in 9th dimension.", "12fps looping nodding video avatar fooled 2 directors."],
      votes: 29
    },
    {
      id: 'sarah', name: 'Sarah Okonkwo', role: 'Director of Sync Torment', avatar: '💀',
      rankBadge: '11.4h / day in calls', themeClass: 'card-sarah', kpiTitle: 'Meeting Soul Retention',
      kpiMetric: 4.2, kpiUnit: '% soul at 5 PM', changeText: '↑ +1.8%',
      footerLeft: 'Triple-booked in grids', footerCta: 'Autopsy →',
      tileChartType: 'line', tileChartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      tileChartValues: [12, 8, 5, 3, 4], tileColors: ['#06b6d4'],
      stats: [{ label: 'Call Hours', value: '9.5 hrs' }, { label: 'Bio-Break Deficit', value: '-4.2 hrs' }, { label: 'Sympathy Nods', value: '3,120' }],
      drillChartType: 'line', drillChartLabels: ['9 AM', '11 AM', '1 PM', '3 PM', '5 PM'], drillChartValues: [100, 78, 42, 19, 3],
      insights: ["Attends 3 simultaneous Zooms via 3 separate AirPods.", "Mastered 'Let me give you 3 mins back' like a savior."],
      votes: 31
    },
    {
      id: 'dev', name: 'Dev Patel', role: 'CSS Centering Exorcist', avatar: '⌨️',
      rankBadge: 'Cherry MX Destroyer', themeClass: 'card-dev', kpiTitle: 'Keyboard Slam Kinetic Force',
      kpiMetric: 842, kpiUnit: 'Newtons / Bug', changeText: '↑ +120%',
      footerLeft: '3 spacebars in orbit', footerCta: 'Smash Key',
      tileChartType: 'bar', tileChartLabels: ['Bug Fix', 'Meeting Notes', 'Ctrl+Alt+Del', 'Esc'],
      tileChartValues: [92, 76, 54, 38], tileColors: ['#ef4444', '#f97316', '#8b5cf6', '#ec4899'],
      legendItems: [
        { label: 'Bug Fix', percent: '92%', color: '#ef4444' },
        { label: 'Meeting Notes', percent: '76%', color: '#f97316' },
        { label: 'Ctrl+Alt+Del', percent: '54%', color: '#8b5cf6' },
        { label: 'Esc', percent: '38%', color: '#ec4899' }
      ],
      stats: [{ label: 'Keycaps in Ceiling', value: '27' }, { label: 'Enter Decibel', value: '114 dB' }, { label: 'Curse Words', value: '2,490' }],
      drillChartType: 'polarArea', drillChartLabels: ['z-index wars', 'Safari bug', 'CORS error', 'npm 404'], drillChartValues: [420, 890, 740, 990],
      insights: ["Earthquake sensors detected 2.4 Richter tremor during div centering.", "F5 punched straight through a mahogany desk."],
      votes: 56
    },
    {
      id: 'luna', name: 'Luna Rodriguez', role: 'Chief Hieroglyphics Officer', avatar: '🚀',
      rankBadge: 'Alphabet Deprecated', themeClass: 'card-luna', kpiTitle: 'Slack Emoji-To-Word Ratio',
      kpiMetric: 18.4, kpiUnit: 'emojis per word', changeText: '↑ +22%',
      footerLeft: 'No English nouns in 8w', footerCta: 'Decipher →',
      tileChartType: 'polarArea', tileChartLabels: ['Laughs', 'Deadlines', 'Fire', 'Other'],
      tileChartValues: [38, 24, 18, 20], tileColors: ['#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'],
      legendItems: [
        { label: 'Laughs', percent: '38%', color: '#f59e0b' },
        { label: 'Deadlines', percent: '24%', color: '#3b82f6' },
        { label: 'Fire', percent: '18%', color: '#ef4444' },
        { label: 'Other', percent: '20%', color: '#8b5cf6' }
      ],
      stats: [{ label: 'Custom Emojis', value: '412' }, { label: 'Consecutive Emojis', value: '89' }, { label: 'English Letters', value: '4' }],
      drillChartType: 'radar', drillChartLabels: ['Fire', 'Skull', 'Clown', 'Parrot', 'Eyes'], drillChartValues: [98, 92, 85, 99, 94],
      insights: ["Wrote 14-page cloud RFC purely using 💀, 🚢, 🧱, 🚀 glyphs. Approved.", "Cambridge linguists analyzing her Slack bio."],
      votes: 49
    }
  ]);

  sortOption = signal<string>('rank');

  filteredMembers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filterId = this.selectedMemberId();

    return this.membersList().filter(m => {
      const matchesFilter = filterId === 'all' || m.id === filterId;
      const matchesSearch = !query || 
        m.name.toLowerCase().includes(query) || 
        m.role.toLowerCase().includes(query) ||
        m.rankBadge.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  });

  sortedMembers = computed(() => {
    const list = [...this.filteredMembers()];
    const opt = this.sortOption();

    if (opt === 'chaos') {
      return list.sort((a, b) => Number(b.kpiMetric) - Number(a.kpiMetric));
    } else if (opt === 'name') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  });

  onSearchChange(val: string) {
    this.searchQuery.set(val);
    setTimeout(() => this.initTileCharts(), 80);
  }

  onFilterChange(val: string) {
    this.selectedMemberId.set(val);
    setTimeout(() => this.initTileCharts(), 80);
  }

  onSortChange(val: string) {
    this.sortOption.set(val);
  }

  clearFilter() {
    this.searchQuery.set('');
    this.selectedMemberId.set('all');
    this.sortOption.set('rank');
    setTimeout(() => this.initTileCharts(), 80);
  }

  scrollToLeaderboard() {
    const el = document.querySelector('.leaderboard-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      this.showToast('🏆 Scrolled to Full Quantum Chaos Leaderboard Table!');
    }
  }

  openDrawerById(id: string) {
    const m = this.membersList().find(x => x.id === id);
    if (m) {
      this.openDrawer(m);
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.scrollProgress.set(height > 0 ? (winScroll / height) * 100 : 0);
  }

  @HostListener('window:keydown.escape')
  onEscape() {
    if (this.isStealthMode()) this.toggleStealthMode();
    this.closeDrawer();
    this.closeExcuseWheel();
    this.closeAddMemberModal();
  }

  ngAfterViewInit() {
    document.documentElement.setAttribute('data-theme', this.isDarkMode() ? 'dark' : 'light');
    
    this.tileCanvases.changes.subscribe(() => {
      this.initTileCharts();
      this.initBottomCharts();
    });

    setTimeout(() => {
      this.initTileCharts();
      this.initBottomCharts();
    }, 120);

    // Rotate breaking news ticker
    this.newsInterval = setInterval(() => {
      this.latestNewsIndex.update(idx => (idx + 1) % this.tickerNews.length);
    }, 4500);

    // Chaos Mode live counter ticks
    this.chaosInterval = setInterval(() => {
      if (this.isCrazyMode() && !this.isStealthMode()) {
        if (Math.random() > 0.4) this.snackCount.update(c => c + 1);
        if (Math.random() > 0.6) this.emailCount.update(c => c + 1);
      }
    }, 3000);
  }

  ngOnDestroy() {
    this.tileChartInstances.forEach(c => c.destroy());
    this.bottomChartInstances.forEach(c => c.destroy());
    if (this.drawerChartInstance) this.drawerChartInstance.destroy();
    if (this.newsInterval) clearInterval(this.newsInterval);
    if (this.chaosInterval) clearInterval(this.chaosInterval);
  }

  // Web Audio API Synthesizer Sound System
  private getAudioContext(): AudioContext | null {
    if (!this.soundEnabled()) return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  toggleSound() {
    this.soundEnabled.update(v => !v);
    this.showToast(this.soundEnabled() ? '🔊 SOUND EFFECTS ENABLED!' : '🔇 SOUND MUTED');
  }

  playSnackSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(350, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  playSmashSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  playEmailSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  }

  playExcuseSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }

  playFanfareSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + idx * 0.09;
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  playSirenSound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.2);
    osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  }

  // Canvas Confetti Celebration Particle System
  triggerConfetti(golden: boolean = false) {
    if (!this.confettiCanvas) return;
    const canvas = this.confettiCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; rotation: number;
      rotSpeed: number; opacity: number;
    }> = [];

    const colors = golden
      ? ['#f59e0b', '#fbbf24', '#d97706', '#ffffff', '#fef08a']
      : ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'];

    const count = golden ? 220 : 140;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 400,
        y: canvas.height / 3 + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 22,
        vy: (Math.random() - 0.9) * 24,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 14 + 6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        opacity: 1
      });
    }

    const startTime = Date.now();
    const render = () => {
      const elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.42;
        p.rotation += p.rotSpeed;
        if (elapsed > 2000) p.opacity -= 0.03;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (elapsed < 3200) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    requestAnimationFrame(render);
  }

  // 🚨 "Boss Is Coming!" Emergency Stealth Mode Toggle
  toggleStealthMode() {
    this.isStealthMode.update(v => !v);
    if (this.isStealthMode()) {
      this.playSirenSound();
      this.showToast('🚨 PANIC MODE ACTIVATED! Emergency Q4 EBITDA Corporate Spreadsheet View Active!');
    } else {
      this.playFanfareSound();
      this.showToast('🤪 BACK TO OFFICE COMPETITION DASHBOARD!');
    }
  }

  // 🎡 Spin the Wheel of Corporate Excuses
  openExcuseWheel() { this.isWheelOpen.set(true); }
  closeExcuseWheel() { this.isWheelOpen.set(false); }

  spinWheel() {
    if (this.isSpinning()) return;
    this.isSpinning.set(true);
    this.playExcuseSound();
    
    let counter = 0;
    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * this.excuseList.length);
      this.selectedExcuse.set(this.excuseList[randomIndex]);
      counter++;
      if (counter > 15) {
        clearInterval(spinInterval);
        this.isSpinning.set(false);
        this.triggerConfetti();
        this.playFanfareSound();
        this.showToast('🎯 NEW CORPORATE EXCUSE GENERATED!');
      }
    }, 100);
  }

  // 👥 Add Custom Teammate Generator
  openAddMemberModal() { this.isAddMemberOpen.set(true); }
  closeAddMemberModal() { this.isAddMemberOpen.set(false); }

  submitNewMember() {
    const name = this.newMemberName().trim() || 'Awesome Teammate';
    const role = this.newMemberRole().trim() || 'Senior Synergy Specialist';
    const avatar = this.newMemberAvatar().trim() || '🥷';
    const kpiTitle = this.newMemberKpiTitle().trim() || 'Chai Break Velocity';
    const kpiMetric = this.newMemberKpiMetric() || 9.9;
    const kpiUnit = this.newMemberKpiUnit().trim() || 'cups / hr';
    const badge = this.newMemberBadge().trim() || 'Office MVP';

    const newId = 'custom_' + Date.now();
    const newMember: MetricCardData = {
      id: newId,
      name, role, avatar, rankBadge: badge,
      themeClass: 'card-alex',
      kpiTitle, kpiMetric, kpiUnit, changeText: '↑ +100%',
      footerLeft: 'Live Added Teammate',
      footerCta: 'Forensics →',
      tileChartType: 'bar',
      tileChartLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      tileChartValues: [15, 28, 42, 65, 95],
      tileColors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'],
      stats: [{ label: 'Popularity', value: '100%' }, { label: 'Coffee Velocity', value: '8/day' }, { label: 'HR Points', value: '+50' }],
      drillChartType: 'line',
      drillChartLabels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'],
      drillChartValues: [50, 75, 90, 100],
      insights: ["Dynamically added live during office competition!", "Voted 1st place colleague in the entire room."],
      votes: 15
    };

    this.membersList.update(list => [...list, newMember]);
    this.closeAddMemberModal();
    this.showToast(`✨ NEW TEAMMATE ADDED: ${name} (${role})!`);
    this.playFanfareSound();
    this.triggerConfetti();
    setTimeout(() => this.initTileCharts(), 100);
  }

  toggleTheme() {
    this.isDarkMode.update(val => !val);
    document.documentElement.setAttribute('data-theme', this.isDarkMode() ? 'dark' : 'light');
    this.initTileCharts();
    this.initBottomCharts();
    if (this.activeMember()) {
      const cur = this.activeMember();
      if (cur) this.openDrawer(cur);
    }
  }

  toggleCrazyMode() {
    this.isCrazyMode.update(val => !val);
    if (this.isCrazyMode()) {
      this.playFanfareSound();
      this.triggerConfetti();
    }
    this.showToast(this.isCrazyMode() ? '🤪 CRAZY CHAOS MODE ACTIVATED!' : '😇 BORING CORPORATE MODE ACTIVATED');
  }

  // Crazy Interactive Actions
  raidSnack() {
    this.snackCount.update(c => c + 1);
    this.playSnackSound();
    this.triggerConfetti();
    this.showToast('🍕 SNACK RAIDED! Alex stole a Chobani yogurt from fridge!');
  }

  smashKeyboard() {
    this.keyboardSmashed.update(c => c + 1);
    this.playSmashSound();
    this.screenShaking.set(true);
    setTimeout(() => this.screenShaking.set(false), 450);
    this.showToast('💥 SMASH! Dev Patel launched another spacebar into orbit!');
  }

  generateThreat() {
    this.emailCount.update(c => c + 1);
    this.playEmailSound();
    this.showToast('📧 PRIYA: "Per my previous email (which you failed to read)..."');
  }

  generateExcuse() {
    this.webcamExcuseCount.update(c => c + 1);
    this.playExcuseSound();
    this.showToast('🫥 MARCUS: "My webcam photons are undergoing solar interference."');
  }

  showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3200);
  }

  private getTileScales(type: string): any {
    if (type === 'bar' || type === 'line') {
      return {
        x: { display: false },
        y: { display: false }
      };
    }
    if (type === 'radar' || type === 'polarArea') {
      return {
        r: {
          display: false,
          ticks: { display: false },
          grid: { display: false }
        }
      };
    }
    return {};
  }

  private initTileCharts() {
    this.tileChartInstances.forEach(c => c.destroy());
    this.tileChartInstances = [];

    const isDark = this.isDarkMode();

    this.tileCanvases.forEach((canvasRef, index) => {
      const m = this.filteredMembers()[index];
      if (!m) return;
      const ctx = canvasRef.nativeElement.getContext('2d');
      if (!ctx) return;

      let datasetBg: any = m.tileColors;
      let datasetBorder: any = m.tileColors[0];
      let borderWidth = 2;
      let fillOption: any = false;

      if (m.tileChartType === 'line') {
        const areaGrad = ctx.createLinearGradient(0, 0, 0, 110);
        areaGrad.addColorStop(0, isDark ? 'rgba(6, 182, 212, 0.45)' : 'rgba(6, 182, 212, 0.35)');
        areaGrad.addColorStop(1, isDark ? 'rgba(6, 182, 212, 0.0)' : 'rgba(6, 182, 212, 0.0)');
        datasetBg = areaGrad;
        datasetBorder = '#06b6d4';
        borderWidth = 3;
        fillOption = true;
      } else if (m.tileChartType === 'radar') {
        const radarGrad = ctx.createRadialGradient(60, 60, 10, 60, 60, 60);
        radarGrad.addColorStop(0, isDark ? 'rgba(139, 92, 246, 0.55)' : 'rgba(139, 92, 246, 0.35)');
        radarGrad.addColorStop(1, isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)');
        datasetBg = radarGrad;
        datasetBorder = '#8b5cf6';
        borderWidth = 2;
        fillOption = true;
      } else if (m.tileChartType === 'bar') {
        const barGradients = m.tileColors.map((col: string) => {
          const g = ctx.createLinearGradient(0, 0, 0, 110);
          g.addColorStop(0, col);
          g.addColorStop(1, isDark ? 'rgba(17, 24, 39, 0.4)' : 'rgba(241, 245, 249, 0.8)');
          return g;
        });
        datasetBg = barGradients;
        datasetBorder = m.tileColors;
        borderWidth = 1;
      } else if (m.tileChartType === 'doughnut') {
        datasetBg = m.tileColors;
        datasetBorder = isDark ? '#111827' : '#ffffff';
        borderWidth = 2;
      } else if (m.tileChartType === 'polarArea') {
        datasetBg = m.tileColors.map((c: string) => c + (isDark ? 'cc' : 'ee'));
        datasetBorder = isDark ? '#111827' : '#ffffff';
        borderWidth = 2;
      }

      const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: m.id === 'dev' ? 'y' : 'x',
        cutout: m.tileChartType === 'doughnut' ? '72%' : undefined,
        animation: {
          duration: 1600,
          easing: 'easeOutQuart',
          delay: (context: any) => (context.type === 'data' && context.mode === 'default' ? context.dataIndex * 120 : 0)
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            titleColor: isDark ? '#f9fafb' : '#0f172a',
            bodyColor: isDark ? '#cbd5e1' : '#334155',
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0',
            borderWidth: 1,
            padding: 10,
            displayColors: true,
            boxPadding: 4,
            usePointStyle: true
          }
        },
        scales: this.getTileScales(m.tileChartType)
      };

      const chart = new Chart(ctx, {
        type: m.tileChartType,
        data: {
          labels: m.tileChartLabels,
          datasets: [{
            data: m.tileChartValues,
            backgroundColor: datasetBg,
            borderColor: datasetBorder,
            borderWidth: borderWidth,
            fill: fillOption,
            tension: 0.45,
            pointRadius: m.tileChartType === 'line' || m.tileChartType === 'radar' ? 4 : 0,
            pointHoverRadius: 7,
            pointBackgroundColor: datasetBorder,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            borderRadius: m.tileChartType === 'bar' ? 8 : 0,
            borderSkipped: false
          }]
        },
        options: chartOptions as any
      });
      this.tileChartInstances.push(chart);
    });
  }

  private initBottomCharts() {
    this.bottomChartInstances.forEach(c => c.destroy());
    this.bottomChartInstances = [];

    // 1. Team Chaos Radar Chart
    if (this.radarCanvas) {
      const ctx = this.radarCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const radGrad = ctx.createRadialGradient(90, 90, 10, 90, 90, 90);
        radGrad.addColorStop(0, 'rgba(236, 72, 153, 0.6)');
        radGrad.addColorStop(1, 'rgba(139, 92, 246, 0.15)');

        const radarChart = new Chart(ctx, {
          type: 'radar',
          data: {
            labels: ['Snacking', 'Meetings', 'Excuses', 'Keyboard Rage', 'Slack Chaos', 'Productivity'],
            datasets: [{
              label: 'Chaos Rating',
              data: [92, 78, 85, 68, 88, 32],
              backgroundColor: radGrad,
              borderColor: '#ec4899',
              borderWidth: 2,
              pointBackgroundColor: '#ec4899',
              pointRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              r: {
                grid: { color: 'rgba(255,255,255,0.12)' },
                angleLines: { color: 'rgba(255,255,255,0.12)' },
                pointLabels: { color: '#cbd5e1', font: { family: 'Plus Jakarta Sans', size: 10, weight: 'bold' } },
                ticks: { display: false }
              }
            }
          }
        });
        this.bottomChartInstances.push(radarChart);
      }
    }

    // 2. Snack Consumption Breakdown Donut Chart
    if (this.snackBreakdownCanvas) {
      const ctx = this.snackBreakdownCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const donutChart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Chips', 'Cookies', 'Coffee', 'Beverages', 'Sweets', 'Others'],
            datasets: [{
              data: [32, 24, 18, 12, 8, 6],
              backgroundColor: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '76%',
            plugins: { legend: { display: false } }
          }
        });
        this.bottomChartInstances.push(donutChart);
      }
    }

    // 3. Meeting Energy Decay Line Chart
    if (this.energyDecayCanvas) {
      const ctx = this.energyDecayCanvas.nativeElement.getContext('2d');
      if (ctx) {
        const lineGrad = ctx.createLinearGradient(0, 0, 0, 160);
        lineGrad.addColorStop(0, 'rgba(236, 72, 153, 0.5)');
        lineGrad.addColorStop(1, 'rgba(236, 72, 153, 0.01)');

        const energyChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['0h', '1h', '2h', '3h', '4h'],
            datasets: [{
              data: [100, 48, 25, 12, 2],
              backgroundColor: lineGrad,
              borderColor: '#ec4899',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: '#ec4899'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } },
              y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.06)' } }
            }
          }
        });
        this.bottomChartInstances.push(energyChart);
      }
    }
  }

  openDrawer(m: MetricCardData) {
    this.activeMember.set(m);
    this.playEmailSound();
    setTimeout(() => {
      if (!this.drawerCanvas) return;
      if (this.drawerChartInstance) this.drawerChartInstance.destroy();
      const ctx = this.drawerCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      const isDark = this.isDarkMode();
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

      let drawerScales: any = {};
      if (m.drillChartType === 'radar' || m.drillChartType === 'polarArea') {
        drawerScales = {
          r: {
            grid: { color: gridColor },
            pointLabels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 12, weight: 'bold' } },
            angleLines: { color: gridColor },
            ticks: { display: false }
          }
        };
      } else if (m.drillChartType === 'bar' || m.drillChartType === 'line') {
        drawerScales = {
          x: { ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } }, grid: { color: gridColor } }
        };
      }

      let modalBg: any = m.tileColors;
      if (m.drillChartType === 'line') {
        const grad = ctx.createLinearGradient(0, 0, 0, 240);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0.02)');
        modalBg = grad;
      } else if (m.drillChartType === 'radar') {
        const radGrad = ctx.createRadialGradient(140, 140, 10, 140, 140, 140);
        radGrad.addColorStop(0, 'rgba(139, 92, 246, 0.5)');
        radGrad.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
        modalBg = radGrad;
      } else if (m.drillChartType === 'bar') {
        modalBg = m.tileColors.map(c => {
          const g = ctx.createLinearGradient(0, 0, 0, 220);
          g.addColorStop(0, c);
          g.addColorStop(1, isDark ? 'rgba(17, 24, 39, 0.5)' : 'rgba(241, 245, 249, 0.8)');
          return g;
        });
      }

      const modalOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: m.drillChartType === 'doughnut' ? '65%' : undefined,
        animation: {
          duration: 1800,
          easing: 'easeInOutCubic'
        },
        plugins: {
          legend: {
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: 'bold', size: 13 } }
          },
          tooltip: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            titleColor: isDark ? '#f9fafb' : '#0f172a',
            bodyColor: isDark ? '#cbd5e1' : '#334155',
            borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
            borderWidth: 1,
            padding: 12
          }
        },
        scales: drawerScales
      };

      this.drawerChartInstance = new Chart(ctx, {
        type: m.drillChartType,
        data: {
          labels: m.drillChartLabels,
          datasets: [{
            label: 'Forensic Audit Score',
            data: m.drillChartValues,
            backgroundColor: modalBg,
            borderColor: m.tileColors[0],
            borderWidth: 3,
            fill: m.drillChartType === 'line' || m.drillChartType === 'radar',
            tension: 0.45,
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBackgroundColor: m.tileColors[0],
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            borderRadius: m.drillChartType === 'bar' ? 10 : 0
          }]
        },
        options: modalOptions as any
      });
    }, 50);
  }

  closeDrawer() {
    this.activeMember.set(null);
    if (this.drawerChartInstance) {
      this.drawerChartInstance.destroy();
      this.drawerChartInstance = null;
    }
  }
}