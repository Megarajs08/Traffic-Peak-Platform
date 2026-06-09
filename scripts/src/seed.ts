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
