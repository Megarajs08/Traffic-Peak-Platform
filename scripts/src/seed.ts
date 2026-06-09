import { db } from "@workspace/db";
import { usersTable, lessonsTable, blogPostsTable } from "@workspace/db";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Seeding database...");

  // Create demo users
  const passwordHash = await bcrypt.hash("password123", 10);
  const [admin] = await db
    .insert(usersTable)
    .values([
      { email: "admin@trafficpeak.app", username: "admin", name: "Admin User", passwordHash, role: "admin" },
      { email: "alice@example.com", username: "alice", name: "Alice Smith", passwordHash },
      { email: "bob@example.com", username: "bob", name: "Bob Johnson", passwordHash },
      { email: "speedster@example.com", username: "speedster", name: "Speed Typer", passwordHash },
    ])
    .onConflictDoNothing()
    .returning();

  console.log("Users seeded");

  // Seed lessons
  const lessons = [
    // Beginner
    { title: "Home Row Keys", level: "beginner", category: "Foundation", content: "asdf jkl; asdf jkl; asdf jkl; fjdk fjdk fjdk slaf slaf slaf dkfj dkfj dkfj asdfjkl; asdfjkl; dkfjasls", description: "Master the home row. Your fingers live here.", order: 1 },
    { title: "QWER UIOP", level: "beginner", category: "Foundation", content: "qwer uiop qwer uiop qwer uiop werq poiu werq poiu fgkj fgkj fghj fghj qwer uiop asdf jkl; qwer asdf uiop jkl;", description: "Extend from home row to the top row.", order: 2 },
    { title: "ZXCV NM,.?", level: "beginner", category: "Foundation", content: "zxcv nm,. zxcv nm,. zxcv nm,. vczx .mnm vczx .mnm xcvb mnb, xcvb mnb, zxcv nm,. asdf jkl; zxcv nm,.", description: "Add the bottom row to your toolkit.", order: 3 },
    { title: "Common 3-Letter Words", level: "beginner", category: "Words", content: "the and for not but can her its who him had how did get let yet own ago set off new old few age ago use say see two may has our try man far put end are was day him day its any own see say get two", description: "Practice with the most common short words.", order: 4 },
    { title: "Numbers Row 1-5", level: "beginner", category: "Numbers", content: "1 2 3 4 5 12 23 34 45 51 123 234 345 451 512 1234 2345 3451 4512 5123 11 22 33 44 55 13 24 35 41 52 321 432 543 154 265", description: "Get comfortable typing numbers on the left side.", order: 5 },
    // Intermediate
    { title: "Capital Letters", level: "intermediate", category: "Shift Keys", content: "The Quick Brown Fox Jumps Over The Lazy Dog Hello World My Name Is Alice Meet Bob Johnson Today Is Monday The Sun Is Bright I Love Typing Fast Always Practice Every Day", description: "Practice using shift for capital letters.", order: 6 },
    { title: "Punctuation Basics", level: "intermediate", category: "Punctuation", content: "Hello, world! How are you? I am fine, thank you. Let's practice: typing, reading, and writing. Wow! That's great. Can you believe it? Yes, I can! One, two, three...", description: "Commas, periods, question marks, and exclamation points.", order: 7 },
    { title: "Common Digraphs", level: "intermediate", category: "Speed", content: "th th th the the this that then there they their ch ch ch check change choose sh sh sh should show share wh wh wh when what where which why who", description: "Letter pairs that appear together frequently.", order: 8 },
    { title: "Long Words Challenge", level: "intermediate", category: "Vocabulary", content: "comfortable information important difference experience community government understand available everything technology responsible communication organization entertainment professional development knowledge", description: "Build speed with common long words.", order: 9 },
    { title: "Numbers and Symbols", level: "intermediate", category: "Numbers", content: "My phone is 555-1234. Email me at test@example.com. The price is $9.99 or maybe $19.50. I was born in 1990. Visit http://example.com for more info!", description: "Real-world text with numbers and common symbols.", order: 10 },
    // Advanced
    { title: "Code Snippets", level: "advanced", category: "Programming", content: "const x = 10; let y = 20; if (x < y) { console.log('x is smaller'); } function add(a, b) { return a + b; } const result = add(x, y);", description: "Common code syntax at speed.", order: 11 },
    { title: "Speed Burst", level: "advanced", category: "Speed", content: "type fast type fast type fast and faster still go now hit the keys feel the rhythm build the speed keep the pace never stop keep going faster and faster until the words flow like water", description: "Short, punchy words for maximum WPM.", order: 12 },
    { title: "Quotes Speed Drill", level: "advanced", category: "Literature", content: "To be or not to be that is the question whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune or to take arms against a sea of troubles", description: "Famous quotes for accuracy and speed.", order: 13 },
    { title: "Email Writing", level: "advanced", category: "Business", content: "Hi team, I wanted to follow up on our discussion from yesterday's meeting. Please review the attached document and let me know your thoughts by Friday. Best regards, the management team.", description: "Professional writing with realistic content.", order: 14 },
    { title: "Ultimate Speed Test", level: "advanced", category: "Challenge", content: "The ability to type quickly and accurately is an invaluable skill in the modern world. Whether you are writing emails, coding software, or taking notes in class, fast typing will save you time and make you more productive.", description: "Full sentences for the serious typist.", order: 15 },
  ];

  await db.insert(lessonsTable).values(lessons).onConflictDoNothing();
  console.log("Lessons seeded");

  // Seed blog posts
  const posts = [
    {
      title: "How to Break the 100 WPM Barrier",
      slug: "how-to-break-100-wpm",
      content: `Breaking the 100 WPM barrier is a milestone that separates casual typists from proficient ones. Most people plateau around 60-70 WPM and wonder why they can't seem to push through.\n\nThe key insight is that speed follows accuracy. If you're making errors and correcting them, you're wasting time. Force yourself to slow down until you can type without errors, then gradually increase speed.\n\nPractice with purpose: don't just mindlessly type. Focus on your weakest keys, the ones that cause you to hesitate or look at the keyboard.\n\nUse a proper typing posture. Sit straight, keep your wrists slightly elevated, and never rest your wrists on the desk while typing — only during pauses.\n\nConsistency beats intensity. 20 minutes of focused practice every day beats 2 hours once a week. Your muscle memory develops through repetition over time.`,
      excerpt: "Learn the techniques that serious typists use to push past the 100 WPM ceiling.",
      category: "Typing Tips",
      published: true,
    },
    {
      title: "The Best Mechanical Keyboards for Typing Speed",
      slug: "best-mechanical-keyboards-typing-speed",
      content: `Your keyboard is your primary tool. Using the right one can make a significant difference in both comfort and speed.\n\nFor typing speed, linear switches like Cherry MX Red or Speed Silver are popular because they actuate smoothly without a tactile bump. This allows your fingers to glide between keys rapidly.\n\nHowever, many fast typists prefer tactile switches like Cherry MX Brown or Topre, because the feedback helps them avoid bottoming out and reduces fatigue.\n\nKeyboard size matters too. A tenkeyless (TKL) layout moves the mouse closer, reducing shoulder strain. Many competitive typists use 60% or 65% layouts for maximum efficiency.\n\nFor raw performance, consider the Topre Realforce, HHKB Professional, or Das Keyboard 5QS. For budget options, the Keychron K2 and Logitech G Pro X are excellent choices.`,
      excerpt: "A deep dive into the mechanical keyboards that top typists swear by.",
      category: "Keyboard Guides",
      published: true,
    },
    {
      title: "Why Fast Typing Makes You a Better Developer",
      slug: "fast-typing-makes-you-better-developer",
      content: `There is ongoing debate about whether typing speed matters for programmers. The argument against it is that thinking is the bottleneck, not typing.\n\nThis is partially true, but it misses an important nuance: when you type faster, your thoughts and your typing stay in sync. You don't lose your train of thought waiting for your fingers to catch up.\n\nFast typing also means faster iteration. When you can quickly rename a variable, restructure a function, or write a test — the friction of each individual action is lower, and you do more of them.\n\nThere's also the matter of flow state. When typing is effortless and automatic, you spend 100% of your cognitive resources on the problem, not on the mechanical act of writing.\n\nTarget 80+ WPM for code specifically. Code has different patterns than prose — lots of special characters, function names, and syntax. Practice with actual code snippets.`,
      excerpt: "Why programmer keyboard speed matters more than you think.",
      category: "Career Skills",
      published: true,
    },
    {
      title: "The Science of Touch Typing: How Muscle Memory Works",
      slug: "science-of-touch-typing-muscle-memory",
      content: `Touch typing is the practice of typing without looking at the keyboard. This seems simple, but it requires building a complex motor program in your brain and muscles.\n\nWhen you first learn to type, you're operating in what psychologists call the cognitive stage. Every keystroke requires conscious thought. Your brain identifies the letter, locates it, and directs your finger.\n\nWith practice, you move into the associative stage — you still think about typing, but individual keystrokes become more automatic. Finally, you reach the autonomous stage where typing is fully automatic.\n\nThe shift to autonomous happens through deliberate practice: focused repetition with feedback. This is why simply typing emails won't make you faster — you need to deliberately practice the hard parts.\n\nSleep is critical for skill consolidation. Your brain processes and consolidates motor skills during sleep. This is why practicing daily, even briefly, outperforms marathon sessions.`,
      excerpt: "Understanding the neuroscience behind touch typing helps you practice more effectively.",
      category: "Typing Tips",
      published: true,
    },
    // Typing Lessons category
    {
      title: "The Complete Beginner's Guide to Touch Typing",
      slug: "beginners-guide-touch-typing",
      content: `Touch typing is the single most high-leverage skill you can develop for productivity on a computer. This guide covers everything you need to start from zero.\n\nStep 1: Learn the home row. Your left-hand fingers rest on A, S, D, F. Your right-hand fingers rest on J, K, L, and semicolon. Your thumbs rest on the spacebar. This is your home position.\n\nStep 2: Never look at the keyboard. This is the hardest habit to break. Cover your hands with a cloth if you have to. Looking at keys reinforces the wrong neural pathways.\n\nStep 3: Use all ten fingers. Each finger is responsible for a specific set of keys. The pinky fingers handle the outer columns, while the index fingers each cover two columns in the center.\n\nStep 4: Start slow. Aim for 100% accuracy at 20 WPM before trying to go faster. Accuracy first, always. Speed is a natural byproduct of well-trained fingers.\n\nStep 5: Practice daily for at least 15 minutes. Consistency matters more than duration. Short daily sessions build muscle memory far more effectively than sporadic long sessions.`,
      excerpt: "Everything you need to start touch typing from scratch — home row, finger placement, and your first lessons.",
      category: "Typing Lessons",
      published: true,
    },
    {
      title: "Mastering the Number Row: A Step-by-Step Guide",
      slug: "mastering-number-row-typing",
      content: `The number row is one of the last things most people master in typing, but it's essential for data entry, coding, and professional work.\n\nThe standard number row runs 1-2-3-4-5 on the left side and 6-7-8-9-0 on the right. Your left index finger covers 4 and 5; your right index finger covers 6 and 7.\n\nThe key challenge with numbers is that your fingers must travel further from the home row. This requires precise muscle memory for each key's position relative to your resting fingers.\n\nExercise 1: Practice individual digits in isolation. Type each digit 20 times, focusing on returning to the home row after each press.\n\nExercise 2: Type sequences like 12345 and 67890 until the movement becomes automatic.\n\nExercise 3: Type real-world number patterns: dates (06/09/2026), phone numbers (555-123-4567), prices ($9.99, $1,299.00), and ZIP codes.\n\nMost people can master the number row to 60+ WPM within 2-3 weeks of focused daily practice.`,
      excerpt: "A structured guide to typing the number row accurately and quickly.",
      category: "Typing Lessons",
      published: true,
    },
    // Productivity category
    {
      title: "10 Keyboard Shortcuts That Will Save You Hours Every Week",
      slug: "keyboard-shortcuts-save-hours",
      content: `Keyboard shortcuts are force multipliers for anyone who works on a computer. Mastering the most important ones can save you 30–60 minutes per day.\n\n1. Ctrl+Z / Cmd+Z — Undo. The most important shortcut. Use it freely.\n2. Ctrl+Shift+Z — Redo. Just as important as undo.\n3. Ctrl+F / Cmd+F — Find in page. Faster than scrolling.\n4. Ctrl+L / Cmd+L — Focus the address bar in any browser.\n5. Alt+Tab / Cmd+Tab — Switch between open applications without touching the mouse.\n6. Ctrl+W / Cmd+W — Close the current tab or window.\n7. Ctrl+T / Cmd+T — Open a new browser tab.\n8. Ctrl+Shift+T — Reopen the last closed tab.\n9. Win+D / Cmd+M — Show desktop (minimise all windows).\n10. Ctrl+Shift+N — New incognito/private window.\n\nLearning these is a one-time investment that pays dividends every single day. Start with the ones you would use most and add more each week.`,
      excerpt: "Stop reaching for the mouse. These 10 shortcuts will transform your daily workflow.",
      category: "Productivity",
      published: true,
    },
    {
      title: "How Typing Speed Affects Your Salary and Career Growth",
      slug: "typing-speed-salary-career-growth",
      content: `Most people don't think about typing speed as a career skill, but the data tells a clear story. Faster typists produce more output, make fewer errors, and are perceived as more competent.\n\nIn roles with high written output — software engineering, content creation, legal work, journalism, data entry, and customer support — typing speed directly affects the volume of work you can produce.\n\nIn competitive hiring, a typing test is a common filter for administrative and clerical roles. Most government and corporate typing tests require 35–50 WPM minimum, with higher roles requiring 60–80 WPM.\n\nBeyond raw output, fast and accurate typing improves your professional image in meetings (when you're taking notes), in email communication, and in documentation quality.\n\nThe typical knowledge worker types 40 WPM. Improving to 80 WPM effectively doubles your written output capacity. For a 40-hour work week with significant writing tasks, this can mean 4–6 hours of recovered productive time per week.`,
      excerpt: "Why your typing speed directly impacts your productivity, output quality, and career earnings.",
      category: "Productivity",
      published: true,
    },
    // Government Exam Preparation category
    {
      title: "SSC CHSL Typing Test: Complete Preparation Guide",
      slug: "ssc-chsl-typing-test-guide",
      content: `The SSC CHSL (Staff Selection Commission Combined Higher Secondary Level) typing test is a mandatory component for Data Entry Operator (DEO) and Lower Divisional Clerk (LDC) posts.\n\nTyping Speed Requirements:\n- LDC/JSA posts: 35 WPM in English or 30 WPM in Hindi\n- DEO posts: 8,000 key depressions per hour (approximately 26–27 WPM with standard text)\n\nThe test is conducted on a computer with a standard QWERTY keyboard. You are given a printed passage and must type it accurately within the time limit.\n\nKey preparation tips:\n1. Practice on TrafficPeak daily. Use the 5-minute test mode to build sustained concentration.\n2. Focus on accuracy first. Errors in the SSC test are heavily penalised — net speed = gross speed minus error deductions.\n3. Practice with Hindi font if appearing for Hindi typing tests. Krutidev and Mangal fonts are commonly used.\n4. Build your speed gradually. Target 45 WPM in English for a comfortable margin above the 35 WPM requirement.\n5. Practice with exam-style paragraphs containing formal, administrative language.\n\nWith 3–4 months of consistent daily practice, most candidates can comfortably clear the typing component.`,
      excerpt: "Complete guide to cracking the SSC CHSL typing test for LDC and DEO positions.",
      category: "Government Exam Preparation",
      published: true,
    },
    {
      title: "IBPS Clerk Typing Test: Speed and Accuracy Requirements",
      slug: "ibps-clerk-typing-test-requirements",
      content: `The IBPS (Institute of Banking Personnel Selection) Clerk exam includes a computer proficiency test that evaluates typing speed and accuracy.\n\nRequirements: Candidates must achieve a minimum typing speed of 20 words per minute (wpm) in English or 15 words per minute in Hindi, with a maximum of 5% errors allowed.\n\nWhile 20 WPM is the minimum, competitive candidates typically aim for 35-40 WPM to demonstrate strong proficiency and confidence during the test.\n\nThe typing test is usually conducted in the online examination hall and consists of typing a passage displayed on screen within a given time.\n\nPreparation Strategy:\n\nWeek 1-2: Master the home row and all letter keys. Aim for zero errors at slow speed.\nWeek 3-4: Build speed with common English words. Push to 25 WPM.\nWeek 5-8: Practice with banking and financial vocabulary. Aim for 35+ WPM.\nWeek 9-12: Full test simulations at exam conditions — 5 minutes, single long passage.\n\nKey mistake to avoid: Over-correcting errors slows you down significantly. Type at a speed where you make fewer than 2-3 errors per 100 words.`,
      excerpt: "Everything you need to know about the IBPS Clerk typing test and how to clear it comfortably.",
      category: "Government Exam Preparation",
      published: true,
    },
  ];

  await db.insert(blogPostsTable).values(posts).onConflictDoNothing();
  console.log("Blog posts seeded");

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
