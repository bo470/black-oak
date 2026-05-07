
export type LanguageCode = 'en-US' | 'en-IN' | 'hinglish' | 'hi-IN';

export interface TranslationStrings {
  // Navigation
  dashboard: string;
  journal: string;
  analytics: string;
  community: string;
  profile: string;
  messaging: string;
  leaderboard: string;
  backtesting: string;
  settings: string;

  // Profile Page
  accountInfo: string;
  fullName: string;
  email: string;
  city: string;
  preferredCurrency: string;
  appearance: string;
  languagePreference: string;
  save: string;
  cancel: string;
  edit: string;
  lightMode: string;
  darkMode: string;
  photoUpdated: string;
  profileUpdated: string;

  // Dashboard
  welcomeBack: string;
  marketSentiment: string;
  recentTrades: string;
  performance: string;
  viewAll: string;
  noTrades: string;
  quickStats: string;
  winRate: string;
  profitFactor: string;
  avgWin: string;
  avgLoss: string;
  disciplineScore: string;
  consistencyScore: string;
  equityCurve: string;
  totalTrades: string;
  netPLLabel: string;
  avgRRLabel: string;
  realizedPNL: string;
  expectedValue: string;
  dailyPNL: string;

  // Metric Explanations
  metricExplanations: Record<string, {
    description: string;
    example: string;
    formula?: string;
    meaning?: string;
  }>;

  // Periods
  today: string;
  last7Days: string;
  last30Days: string;
  customRange: string;

  // Journal
  tradeHistory: string;
  journalSubtitle: string;
  addTrade: string;
  searchTrades: string;
  allMarkets: string;
  allSetups: string;
  exportData: string;
  showFilters: string;
  hideFilters: string;
  resetFilters: string;
  deleteTrade: string;
  editTrade: string;
  saveAsDraft: string;
  noTradesFound: string;
  deleteModalTitle: string;
  deleteModalText: string;
  confirmDelete: string;

  // Buttons & Common
  loading: string;
  error: string;
  success: string;
  back: string;
  next: string;
  finish: string;
  tryAgain: string;
}

export const translations: Record<LanguageCode, TranslationStrings> = {
  'en-US': {
    dashboard: "Dashboard",
    journal: "Journal",
    analytics: "Analytics",
    community: "Community",
    profile: "Profile",
    messaging: "Messages",
    leaderboard: "Leaderboard",
    backtesting: "Backtesting",
    settings: "Settings",
    accountInfo: "Account Information",
    fullName: "Full Name",
    email: "Email Address",
    city: "City",
    preferredCurrency: "Preferred Currency",
    appearance: "Appearance",
    languagePreference: "Language Preference",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    photoUpdated: "Photo updated",
    profileUpdated: "Profile updated successfully.",
    welcomeBack: "Welcome back",
    marketSentiment: "Market Sentiment",
    recentTrades: "Recent Trades",
    performance: "Performance",
    viewAll: "View All",
    noTrades: "No trades recorded yet.",
    quickStats: "Quick Stats",
    winRate: "Win Rate",
    profitFactor: "Profit Factor",
    avgWin: "Avg Profit",
    avgLoss: "Avg Loss",
    disciplineScore: "Discipline Score",
    consistencyScore: "Consistency Score",
    equityCurve: "Equity Curve",
    totalTrades: "Total Trades",
    netPLLabel: "Net P/L",
    avgRRLabel: "Avg R:R",
    realizedPNL: "Realized P/L",
    expectedValue: "Expected Value",
    dailyPNL: "Daily P/L",
    metricExplanations: {
      "Realized PNL": {
        description: "Realized PNL is the actual profit or loss you have booked after closing your trades.",
        example: "Example: You bought a stock at $100 and sold it at $120, your realized profit is $20.",
        formula: "Net P/L = Total Profits - Total Losses - Fees",
        meaning: "It shows your actual cash growth."
      },
      "Winrate": {
        description: "Winrate is the percentage of trades you won out of total trades.",
        example: "Example: If you win 6 out of 10 trades, your winrate is 60%.",
        formula: "(Winning Trades / Total Trades) * 100",
        meaning: "Shows your accuracy in the market."
      },
      "Profit Factor": {
        description: "Profit Factor compares your total profit to total loss to show the sustainability of your strategy.",
        example: "Trades: +2k, -1k, +3k, -1.5k. Gross Profit = 5k. Gross Loss = 2.5k. Factor = 2.",
        formula: "Gross Profit / Gross Loss",
        meaning: "For every ₹1 lost, the system earns ₹2. (>1 is profitable, <1 is losing)."
      },
      "Expected Value": {
        description: "Expected Value (Expectancy) shows how much you can expect to earn per trade on average.",
        example: "If you win $100 with 60% prob and lose $50 with 40% prob, EV is $40.",
        formula: "(Win Rate * Avg Win) - (Loss Rate * Avg Loss)",
        meaning: "The average profit you make every time you click 'Trade'."
      },
      "Daily PNL": {
        description: "Daily PnL shows how much profit or loss you made each day based on your closed trades.",
        example: "Profit $100 and Loss $50 in one day results in $50 Daily PnL.",
        formula: "Sum of Net P/L for the day",
        meaning: "Your day-to-day performance track."
      },
      "Avg Hold Time": {
        description: "The average duration a trade remains open.",
        example: "Trade A: 2h, Trade B: 4h. Avg = 3h.",
        formula: "Total Duration / Total Trades",
        meaning: "How long your capital is tied up."
      },
      "Maximum Profit": {
        description: "The highest profit achieved from a single closed trade.",
        example: "Your best win was $1200.",
        meaning: "Your system's peak performance."
      },
      "Average Win": {
        description: "The average profit of all winning trades.",
        example: "Wins of $100, $200. Avg = $150.",
        meaning: "What you usually gain on a good day."
      },
      "Average Loss": {
        description: "The average loss of all losing trades.",
        example: "Losses of $50, $70. Avg = $60.",
        meaning: "What you usually lose on a bad day."
      },
      "Average P/L per share": {
        description: "The average profit or loss calculated for each single share/unit traded.",
        example: "Profit $100 on 50 shares. Avg = $2/share.",
        meaning: "Unit-level efficiency."
      },
      "Max Drawdown": {
        description: "The maximum peak-to-trough decline in your portfolio value.",
        example: "Portfolio went from $10k to $8k. DD = 20%.",
        meaning: "The biggest 'dip' you've experienced."
      },
      "Total Fees": {
        description: "Total amount paid in brokerage, commissions, and other charges.",
        example: "10 trades at $1 each. Total = $10.",
        meaning: "The cost of doing business."
      },
      "Activity Level": {
        description: "The average number of trades executed per trading day.",
        example: "30 trades over 10 days. Avg = 3/day.",
        meaning: "How active you are in the market."
      },
      "Total Number of Trades": {
        description: "The count of all closed trading positions.",
        example: "You symbols and exited 25 times.",
        meaning: "Your experience level (Sample size)."
      },
      "Winning Count": {
        description: "The number of trades that resulted in a profit.",
        example: "Out of 10 trades, 6 were wins.",
        meaning: "Successful execution count."
      },
      "Losing Count": {
        description: "The number of trades that resulted in a loss.",
        example: "Out of 10 trades, 4 were losses.",
        meaning: "Failed execution count."
      },
      "Consecutive Wins": {
        description: "The longest sequence of winning trades in a row.",
        example: "You won 5 times without a single loss.",
        meaning: "Your best winning streak."
      },
      "Consecutive Losses": {
        description: "The longest sequence of losing trades in a row.",
        example: "You lost 3 times without a single win.",
        meaning: "Your worst losing streak."
      },
      "Hold Time Profit": {
        description: "The average time spent in trades that ended in profit.",
        example: "Winning trades usually last 45 minutes.",
        meaning: "Patience required for wins."
      },
      "Hold Time Loss": {
        description: "The average time spent in trades that ended in loss.",
        example: "Losing trades usually hit SL in 10 minutes.",
        meaning: "Speed of failure detection."
      }
    },
    today: "Today",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    customRange: "Custom Range",
    tradeHistory: "Trade History",
    journalSubtitle: "Analyze your performance metrics.",
    addTrade: "Add Trade",
    searchTrades: "Search trades...",
    allMarkets: "All Markets",
    allSetups: "All Setups",
    exportData: "Export Data",
    showFilters: "Show Filters",
    hideFilters: "Hide Filters",
    resetFilters: "Reset Filters",
    deleteTrade: "Delete Trade",
    editTrade: "Edit Trade",
    saveAsDraft: "Save as Draft",
    noTradesFound: "No trades found.",
    deleteModalTitle: "Delete Trade?",
    deleteModalText: "This action cannot be undone. All data for this trade will be permanently removed.",
    confirmDelete: "Delete",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    back: "Back",
    next: "Next",
    finish: "Finish",
    tryAgain: "Try Again"
  },
  'en-IN': {
    dashboard: "Dashboard",
    journal: "Journal",
    analytics: "Analysis",
    community: "Community",
    profile: "My Profile",
    messaging: "Messages",
    leaderboard: "Leaderboard",
    backtesting: "Practice",
    settings: "Settings",
    accountInfo: "Account Details",
    fullName: "Your Name",
    email: "Email ID",
    city: "City",
    preferredCurrency: "Currency Selection",
    appearance: "Mode Selection",
    languagePreference: "Language Selection",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit Details",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    photoUpdated: "Photo changed",
    profileUpdated: "Profile updated successfully.",
    welcomeBack: "Hi again",
    marketSentiment: "Market Mood",
    recentTrades: "Recent Trades",
    performance: "Results",
    viewAll: "See All",
    noTrades: "No trades found yet.",
    quickStats: "Quick Summary",
    winRate: "Win Rate",
    profitFactor: "Profit Ratio",
    avgWin: "Avg Profit",
    avgLoss: "Avg Loss",
    disciplineScore: "Discipline",
    consistencyScore: "Consistency",
    equityCurve: "Growth Graph",
    totalTrades: "Total Trades",
    netPLLabel: "Net P/L",
    avgRRLabel: "Avg R:R",
    realizedPNL: "Realized P/L",
    expectedValue: "Avg Profit / Trade",
    dailyPNL: "Daily P/L",
    metricExplanations: {
      "Realized PNL": {
        description: "This shows how much profit or loss you got after closing your trade.",
        example: "Example: You buy at 100 and sell at 120 → profit = 20.",
        formula: "Net P/L = Total Profits - Total Losses - Fees",
        meaning: "It shows your actual cash growth."
      },
      "Winrate": {
        description: "How many trades you won out of total trades.",
        example: "Example: 6 wins out of 10 → 60% winrate.",
        formula: "(Wins / Total) * 100",
        meaning: "Shows how accurate you are."
      },
      "Profit Factor": {
        description: "Compares total profit to total loss.",
        example: "Trades: +2k, -1k, +3k, -1.5k. Gross Prof = 5k. Gross Loss = 2.5k. Factor = 2.",
        formula: "Gross Profit / Gross Loss",
        meaning: "Every ₹1 lost earns ₹2. (>1 is good, <1 is bad)."
      },
      "Expected Value": {
        description: "Average profit you can expect per trade.",
        example: "60% win ₹100, 40% loss ₹50 → EV = ₹40.",
        formula: "(Win % * Avg Win) - (Loss % * Avg Loss)",
        meaning: "Average profit per click."
      },
      "Daily PNL": {
        description: "Profit or loss made each day.",
        example: "₹100 profit and ₹50 loss in a day → ₹50 Net.",
        formula: "Sum of results for the day",
        meaning: "Daily performance track."
      },
      "Avg Hold Time": {
        description: "Average time a trade stats open.",
        example: "Trade A: 2h, Trade B: 4h. Avg = 3h.",
        formula: "Total Time / Total Trades",
        meaning: "Capital lock-in time."
      }
    },
    today: "Today",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    customRange: "Custom Range",
    tradeHistory: "Trade History",
    journalSubtitle: "Check your trading result.",
    addTrade: "New Trade",
    searchTrades: "Search...",
    allMarkets: "All Markets",
    allSetups: "All Setups",
    exportData: "Export",
    showFilters: "Show Filters",
    hideFilters: "Hide Filters",
    resetFilters: "Reset Filters",
    deleteTrade: "Remove Trade",
    editTrade: "Edit Trade",
    saveAsDraft: "Draft It",
    noTradesFound: "No trades yet.",
    deleteModalTitle: "Confirm Delete?",
    deleteModalText: "This will permanently remove the trade. Are you sure?",
    confirmDelete: "Yes, Delete",
    loading: "Please wait...",
    error: "Problem",
    success: "Done",
    back: "Go Back",
    next: "Go Next",
    finish: "Done",
    tryAgain: "Try Again"
  },
  'hinglish': {
    dashboard: "Dashboard",
    journal: "Journal",
    analytics: "Analytics",
    community: "Community",
    profile: "Profile",
    messaging: "Messages",
    leaderboard: "Leaderboard",
    backtesting: "Backtesting",
    settings: "Settings",
    accountInfo: "Account Information",
    fullName: "Pura Naam",
    email: "Email ID",
    city: "Shehar",
    preferredCurrency: "Currency Choose Karein",
    appearance: "Appearance Preferences",
    languagePreference: "Bhasha Ki Choice",
    save: "Save Karein",
    cancel: "Cancel Karein",
    edit: "Edit Karein",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    photoUpdated: "Photo update ho gayi",
    profileUpdated: "Profile update ho gayi.",
    welcomeBack: "Swagat hai wapas",
    marketSentiment: "Market Sentiment",
    recentTrades: "Abhi Ke Trades",
    performance: "Performance",
    viewAll: "Sab Dekhein",
    noTrades: "Abhi koi trade nahi hai.",
    quickStats: "Quick Stats",
    winRate: "Win Rate",
    profitFactor: "Profit Factor",
    avgWin: "Avg Win",
    avgLoss: "Avg Loss",
    disciplineScore: "Discipline Score",
    consistencyScore: "Consistency Score",
    equityCurve: "Equity Curve",
    totalTrades: "Total Trades",
    netPLLabel: "Net P/L",
    avgRRLabel: "Avg R:R",
    realizedPNL: "Realized P/L",
    expectedValue: "Expected Value",
    dailyPNL: "Daily P/L",
    metricExplanations: {
      "Realized PNL": {
        description: "Ye batata hai ki trade close karne ke baad tumhe kitna profit ya loss hua.",
        example: "Example: 100 pe buy kiya, 120 pe sell kiya → profit 20.",
        formula: "Net P/L = Total Profits - Total Losses - Fees",
        meaning: "Actual paise kitne badhe."
      },
      "Winrate": {
        description: "Kitne % trades tum sahi the.",
        example: "Example: 10 me se 6 win → winrate 60%.",
        formula: "(Wins / Total) * 100",
        meaning: "Aapki Accuracy kitni hai."
      },
      "Profit Factor": {
        description: "Total profit vs total loss ka ratio.",
        example: "Trades: +2k, -1k, +3k, -1.5k. Gross Prof = 5k. Gross Loss = 2.5k. Factor = 2.",
        formula: "Gross Profit / Gross Loss",
        meaning: "Har ₹1 khone par ₹2 kamaye. (>1 matlab profit, <1 matlab loss)."
      },
      "Expected Value": {
        description: "Average kitna kamaoge har trade me.",
        example: "60% win ₹100, 40% loss ₹50 → EV = ₹40.",
        formula: "(Win rate * Avg win) - (Loss rate * Avg loss)",
        meaning: "Ek trade lene pe average fayda."
      },
      "Daily PNL": {
        description: "Har din ka profit ya loss.",
        example: "Ek din me ₹100 profit aur ₹50 loss → total ₹50 profit.",
        formula: "Din bhar ke trades ka total",
        meaning: "Maheene ka track rakhne me help karta hai."
      },
      "Avg Hold Time": {
        description: "Trade kitni der tak open raha.",
        example: "Trade A: 2h, Trade B: 4h. Avg = 3h.",
        formula: "Total duration / Total trades",
        meaning: "Paise kitni der tak market me rahe."
      },
      "Maximum Profit": {
        description: "Ek single trade se highest profit.",
        example: "Best win: ₹1200.",
        meaning: "Aapki system ki peak performance."
      },
      "Average Win": {
        description: "Saare winning trades ka average profit.",
        example: "Wins of 100, 200. Avg = 150.",
        meaning: "Normal winning day pe itna banta hai."
      },
      "Average Loss": {
        description: "Saare losing trades ka average loss.",
        example: "Losses of 50, 70. Avg = 60.",
        meaning: "Normal losing day pe itna jaata hai."
      },
      "Average P/L per share": {
        description: "Har single share pe kitna profit/loss hua.",
        example: "100 profit on 50 shares → 2/share.",
        meaning: "Quantity ke hisaab se efficiency."
      },
      "Max Drawdown": {
        description: "Account me peak se kitna bada dip aaya.",
        example: "Acc 10k se 8k gira → 20% DD.",
        meaning: "Ab tak ka sabse bada jhatka."
      },
      "Total Fees": {
        description: "Total brokerage aur charges.",
        example: "10 trades @ 1 each → total 10.",
        meaning: "Trading ka kharcha."
      },
      "Activity Level": {
        description: "Rozana average kitne trades le rahe ho.",
        example: "30 trades in 10 days → 3/day.",
        meaning: "Market me kitna active ho."
      },
      "Total Number of Trades": {
        description: "Total trades count symbols aur close karke.",
        example: "Ab tak total 25 trades liye.",
        meaning: "Aapka trading experience (data set)."
      },
      "Winning Count": {
        description: "Kitne trades profit me rahe.",
        example: "10 me se 6 win the.",
        meaning: "Jeetne ki ginti."
      },
      "Losing Count": {
        description: "Kitne trades loss me rahe.",
        example: "10 me se 4 loss the.",
        meaning: "Harne ki ginti."
      },
      "Consecutive Wins": {
        description: "Lagaatar kitne trades jeete.",
        example: "Bina ruke 5 baar win kiya.",
        meaning: "Best winning streak."
      },
      "Consecutive Losses": {
        description: "Lagaatar kitne trades haare.",
        example: "Bina win ke 3 baar loss hua.",
        meaning: "Worst losing streak."
      },
      "Hold Time Profit": {
        description: "Wining trades me average kitna time bitaya.",
        example: "Winning trades usually 45 mins hold hote hain.",
        meaning: "Profit ke liye kitna sabr karna pada."
      },
      "Hold Time Loss": {
        description: "Losing trades me average kitna time bitaya.",
        example: "Losing trades usually 10 mins me cut jaate hain.",
        meaning: "Loss kitni jaldi kata."
      }
    },
    today: "Aaj",
    last7Days: "Pichle 7 Din",
    last30Days: "Pichle 30 Din",
    customRange: "Custom Range",
    tradeHistory: "Trade History",
    journalSubtitle: "Apna trading result check karo.",
    addTrade: "Trade Add Karein",
    searchTrades: "Search karein...",
    allMarkets: "Saare Markets",
    allSetups: "Saare Setups",
    exportData: "Data Export Karein",
    showFilters: "Filters Dikhaein",
    hideFilters: "Filters Chupaein",
    resetFilters: "Filters Reset Karein",
    deleteTrade: "Trade Delete Karein",
    editTrade: "Trade Edit Karein",
    saveAsDraft: "Draft Mein Bachayein",
    noTradesFound: "Abhi koi trade nahi hai.",
    deleteModalTitle: "Trade Delete Karein?",
    deleteModalText: "Yeh badla nahi ja sakta. Trade ka sara data hamesha ke liye hat jayega.",
    confirmDelete: "Delete",
    loading: "Loading ho raha hai...",
    error: "Galti ho gayi",
    success: "Sahi hai",
    back: "Piche",
    next: "Aage",
    finish: "Khatam",
    tryAgain: "Phir se try karein"
  },
  'hi-IN': {
    dashboard: "डैशबोर्ड",
    journal: "जर्नल",
    analytics: "एनालिटिक्स",
    community: "कम्युनिटी",
    profile: "प्रोफ़ाइल",
    messaging: "संदेश",
    leaderboard: "लीडरबोर्ड",
    backtesting: "बैकटेस्टिंग",
    settings: "सेटिंग्स",
    accountInfo: "खाते की जानकारी",
    fullName: "पूरा नाम",
    email: "ईमेल आईडी",
    city: "शहर",
    preferredCurrency: "पसंदीदा मुद्रा",
    appearance: "दिखावट",
    languagePreference: "भाषा पसंद",
    save: "सेव करें",
    cancel: "रद्द करें",
    edit: "बदलें",
    lightMode: "लाइट मोड",
    darkMode: "डार्क मोड",
    photoUpdated: "फोटो अपडेट हो गया",
    profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई।",
    welcomeBack: "वापस स्वागत है",
    marketSentiment: "बाजार की स्थिति",
    recentTrades: "हाल के ट्रेड",
    performance: "प्रदर्शन",
    viewAll: "सभी देखें",
    noTrades: "अभी तक कोई ट्रेड नहीं है।",
    quickStats: "त्वरित आंकड़े",
    winRate: "जीत की दर",
    profitFactor: "लाभ कारक",
    avgWin: "औसत जीत",
    avgLoss: "औसत हार",
    disciplineScore: "अनुशासन स्कोर",
    consistencyScore: "निरंतरता स्कोर",
    equityCurve: "इक्विटी कर्व",
    totalTrades: "कुल ट्रेड",
    netPLLabel: "कुल लाभ/हानि",
    avgRRLabel: "औसत R:R",
    realizedPNL: "महसूस किया लाभ/हानि",
    expectedValue: "अपेक्षित मूल्य",
    dailyPNL: "दैनिक लाभ/हानि",
    metricExplanations: {
      "Realized PNL": {
        description: "यह ट्रेड बंद करने के बाद आपके द्वारा बुक किया गया वास्तविक लाभ या हानि है।",
        example: "उदाहरण: ₹100 में खरीदा, ₹120 में बेचा → ₹20 लाभ।",
        formula: "Net P/L = कुल लाभ - कुल हानि - फीस",
        meaning: "यह आपकी वास्तविक नकदी वृद्धि दर्शाता है।"
      },
      "Winrate": {
        description: "कुल ट्रेडों में से आपके द्वारा जीते गए ट्रेडों का प्रतिशत।",
        example: "उदाहरण: 10 में से 6 जीत → विनरेट 60%।",
        formula: "(जीत वाले ट्रेड / कुल ट्रेड) * 100",
        meaning: "बाजार में आपकी सटीकता को दर्शाता है।"
      },
      "Profit Factor": {
        description: "प्रॉफिट फैक्टर आपके सिस्टम की व्यवहार्यता दिखाने के लिए कुल लाभ को कुल हानि से तुलना करता है।",
        example: "ट्रेड्स: +2k, -1k, +3k, -1.5k. कुल लाभ = 5k. कुल हानि = 2.5k. फ़ैक्टर = 2.",
        formula: "Gross Profit / Gross Loss",
        meaning: "हर ₹1 के नुकसान पर सिस्टम ₹2 कमाता है। (>1 प्रॉफिटेबल, <1 लॉस में)."
      },
      "Expected Value": {
        description: "अपेक्षित मूल्य दिखाता है कि आप प्रति ट्रेड औसतन कितना कमाने की उम्मीद कर सकते हैं।",
        example: "यदि आप 60% संभावना के साथ ₹100 जीतते हैं और 40% के साथ ₹50 हारते हैं, तो EV ₹40 है।",
        formula: "(Win Rate * Avg Win) - (Loss Rate * Avg Loss)",
        meaning: "हर बार 'ट्रेड' बटन दबाने पर औसत मुनाफा।"
      },
      "Daily PNL": {
        description: "दैनिक पीएनएल दिखाता है कि आपने प्रत्येक दिन कितना लाभ या हानि की।",
        example: "एक दिन में ₹100 लाभ और ₹50 हानि का परिणाम ₹50 दैनिक पीएनएल होता है।",
        formula: "दिन के कुल नेट लाभ-हानि का योग",
        meaning: "आपका दैनिक प्रदर्शन ट्रैक।"
      },
      "Avg Hold Time": {
        description: "ट्रेड औसतन कितनी देर तक खुला रहता है।",
        example: "ट्रेड A: 2h, ट्रेड B: 4h. औसत = 3h.",
        formula: "कुल समय / कुल ट्रेड्स",
        meaning: "आपकी पूंजी कितनी देर तक लगी रहती है।"
      },
      "Maximum Profit": {
        description: "एक ही बंद ट्रेड से प्राप्त उच्चतम लाभ।",
        example: "आपकी सबसे बड़ी जीत ₹1200 थी।",
        meaning: "आपके सिस्टम का शिखर प्रदर्शन।"
      },
      "Average Win": {
        description: "सभी सफल ट्रेडों का औसत लाभ।",
        example: "₹100, ₹200 की जीत। औसत = ₹150।",
        meaning: "अच्छे दिन पर आप आमतौर पर कितना कमाते हैं।"
      },
      "Average Loss": {
        description: "सभी असफल ट्रेडों का औसत नुकसान।",
        example: "₹50, ₹70 का नुकसान। औसत = ₹60।",
        meaning: "बुरे दिन पर आप आमतौर पर कितना खोते हैं।"
      },
      "Average P/L per share": {
        description: "ट्रेड किए गए प्रत्येक शेयर/यूनिट के लिए गणना किया गया औसत लाभ या हानि।",
        example: "50 शेयरों पर ₹100 का लाभ। औसत = ₹2/शेयर।",
        meaning: "यूनिट-स्तरीय दक्षता।"
      },
      "Max Drawdown": {
        description: "आपके पोर्टफोलियो मूल्य में अधिकतम गिरावट।",
        example: "पोर्टफोलियो ₹10k से ₹8k हो गया। DD = 20%।",
        meaning: "सबसे बड़ा 'डुबकी' (dip) जो आपने महसूस किया।"
      },
      "Total Fees": {
        description: "ब्रोकरेज, कमीशन और अन्य शुल्कों में भुगतान की गई कुल राशि।",
        example: "प्रत्येक ₹1 पर 10 ट्रेड। कुल = ₹10।",
        meaning: "व्यापार करने की लागत।"
      },
      "Activity Level": {
        description: "प्रति ट्रेडिंग दिन निष्पादित ट्रेडों की औसत संख्या।",
        example: "10 दिनों में 30 ट्रेड। औसत = 3/दिन।",
        meaning: "आप बाजार में कितने सक्रिय हैं।"
      },
      "Total Number of Trades": {
        description: "सभी बंद ट्रेडिंग स्थितियों की कुल संख्या।",
        example: "आपने 25 बार ट्रेड पूरा किया।",
        meaning: "आपका अनुभव स्तर।"
      },
      "Winning Count": {
        description: "उन ट्रेडों की संख्या जिनके परिणामस्वरूप लाभ हुआ।",
        example: "10 में से 6 ट्रेड जीत थे।",
        meaning: "सफल निष्पादन की संख्या।"
      },
      "Losing Count": {
        description: "उन ट्रेडों की संख्या जिनके परिणामस्वरूप हानि हुई।",
        example: "10 में से 4 ट्रेड हार थे।",
        meaning: "असफल निष्पादन की संख्या।"
      },
      "Consecutive Wins": {
        description: "लगातार जीतने वाले ट्रेडों का सबसे लंबा सिलसिला।",
        example: "आपने बिना किसी हार के लगातार 5 बार जीता।",
        meaning: "आपका सबसे अच्छा विनिंग स्ट्रीक।"
      },
      "Consecutive Losses": {
        description: "लगातार हारने वाले ट्रेडों का सबसे लंबा सिलसिला।",
        example: "आपने बिना किसी जीत के लगातार 3 बार हारा।",
        meaning: "आपका सबसे खराब लॉसिंग स्ट्रीक।"
      },
      "Hold Time Profit": {
        description: "लाभ में समाप्त होने वाले ट्रेडों में बिताया गया औसत समय।",
        example: "जीतने वाले ट्रेड आमतौर पर 45 मिनट तक चलते हैं।",
        meaning: "जीत के लिए आवश्यक धैर्य।"
      },
      "Hold Time Loss": {
        description: "हानि में समाप्त होने वाले ट्रेडों में बिताया गया औसत समय।",
        example: "हारने वाले ट्रेड आमतौर पर 10 मिनट में खत्म होते हैं।",
        meaning: "विफलता का जल्दी पता चलना।"
      }
    },
    today: "आज",
    last7Days: "पिछले 7 दिन",
    last30Days: "पिछले 30 दिन",
    customRange: "कस्टम रेंज",
    tradeHistory: "ट्रेड इतिहास",
    journalSubtitle: "अपना ट्रेडिंग परिणाम देखें।",
    addTrade: "ट्रेड जोड़ें",
    searchTrades: "ट्रेड खोजें...",
    allMarkets: "सभी बाजार",
    allSetups: "सभी सेटअप",
    exportData: "डेटा एक्सपोर्ट करें",
    showFilters: "फ़िल्टर दिखाएं",
    hideFilters: "फ़िल्टर छुपाएं",
    resetFilters: "फ़िल्टर रीसेट करें",
    deleteTrade: "ट्रेड हटाएं",
    editTrade: "ट्रेड बदलें",
    saveAsDraft: "ड्राफ्ट में सेव करें",
    noTradesFound: "अभी कोई ट्रेड नहीं है।",
    deleteModalTitle: "ट्रेड हटाएं?",
    deleteModalText: "इस क्रिया को बदला नहीं जा सकता। इस ट्रेड का सारा डेटा स्थायी रूप से हटा दिया जाएगा।",
    confirmDelete: "हटाएं",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफल",
    back: "पीछे",
    next: "आगे",
    finish: "समाप्त",
    tryAgain: "फिर कोशिश करें"
  }
};
