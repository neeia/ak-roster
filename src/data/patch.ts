const patch = [
  {
    version: "3.2.0",
    date: "March 31, 2025",
    title: "Planner Summary",
    content: ["Planner Upgrades!"],
    changelog: [
      "Material Summary",
      ["You can now see the total amount of materials you need to complete all your goals."],
      "Event Planner",
      ["You can plan ahead by including material income from future events."],
      "The Yostar import notice now disappears once you visit the import page once. You can still access the import page in the settings.",
      "We're continuing to make improvements to the Krooster experience. Thank you for your support.",
    ],
  },
  {
    version: "3.1.0",
    date: "March 5, 2025",
    title: "Big QOL Update",
    content: [
      "We've been hard at work over the past two months, fixing things up, making everything feel better, and adding some new features.",
    ],
    changelog: [
      "The planner has been improved in a number of ways.",
      [
        "You can toggle goals on and off, to check the material requirements for specific goals and groups.",
        "The search function works much better now. You can put a minus to exclude any matching goals, or use commas to search for multiple goals at once.",
        "Filtering is significantly improved. Check it out!",
        "Big QoL on crafting. Toggle it all at once,  use shop vouchers to buy materials, and many other small improvements.",
        "The material planner is now significantly more responsive, due to adding a small delay on syncing with the database.",
        "And many, many, many bugfixes. Things should work significantly better and more consistently.",
        "Many thanks to Voiddp for his hard work making countless improvements to the planner.",
      ],
      "Light Mode!",
      [
        "You can now switch between light and dark mode. Give it a try!",
        "For our dedicated dark mode users, we've made some improvements to the dark theme, too.",
      ],
      "Authentication improvements too!",
      [
        "If you created an account with discord, you can now add a password to your account and sign in that way.",
        "Simply sign in with the email account associated with your discord and the new password you've set.`",
      ],
      "Maxed operators now have a special design! This should make parsing a roster at a glance much, much easier.",
      [
        "Maxed is determined by having max level, promotion, potential, skill levels, masteries, and modules available to EN.",
      ],
      "We've made countless style improvements and bug fixes across the site. We sincerely hope you enjoy the new experience.",
    ],
  },
  {
    version: "3.0.0",
    date: "Jan 5, 2025",
    title: "Krooster V3 Out!",
    content: ["After a long time, Krooster v3.0 is finally released. Thanks for your patience!"],
    changelog: [
      "The whole site has received a visual overhaul. It should look cleaner and feel better to use. Here are the largest changes.",
      [
        "As you can see, the homepage has been completely redone. It now has links to every page on the site. I hope you find it useful for navigation.",
        "The planner has been redone entirely. See more on that below.",
        "Profiles look very different now. Fancy!",
        "The recruitment calculator has been given a fresh coat of paint.",
      ],
      "We're migrating to a new account management system. This does mean you will need to make a new account.",
      [
        "On the more technical side of things, Krooster now runs on Supabase instead of Firebase.",
        "The main reason for this change is that adding planner data to the Supabase DB would have been quite expensive.",
        "As a result, we switched our Auth system as well, and now require email verification.",
        "You also have the option to sign in through Discord.",
      ],
      "Krooster can now import data from the game server directly.",
      ["This updates your profile, your roster, and your depot."],
      "The planner system was reworked entirely. It syncs up with your roster and your presets. Go ahead and give it a try!",
      [
        "Goals are now stored account-wide, rather than in the browser.",
        "Completing a goal automatically updates the unit within your roster.",
        "Goals can be rearranged and moved between groups.",
        "Groups can be freely renamed.",
        "Goals now optionally include leveling costs.",
      ],
    ],
  },
];

export default patch;
