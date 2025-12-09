const patch = [
      {
    version: "3.3.5",
    date: "December 11, 2025",
    title: "Images update && IS, RA Archive in Income Tacker",
    content: ["We've uploaded new images, new options to Income Tracker and Import"],
    changelog: [
      "Images updated upto to latest CN AK version (limited banner patch)",
      "Builder in Income Tracker now has all past IS and RA resources in batches to add to your planner. Check new data options in 'From'",
      "Added import option to count unused Operator Tokens as potentials on krooster",
      "Fixes and tweaks:", 
      [
        "Factions will priotize global version for released in global operators: order and new factions availability",
        "Account statistic will now inclule all operators user owns, and wont exclude CN for EN server",
        "Manual supports editing in profile: now supports can be removed, slots inconsistencies were fixed",
        "Back button in Lookup is now working, and menu is accessible",
        "Raidian fixed: can be fully added to roster or goals either manually or via import."
      ]
    ],
  },
    {
    version: "3.3.4",
    date: "October 25, 2025",
    title: "Factions and Statistic",
    content: ["We've added factions and Roster statistics"],
    changelog: [
      "Factions: Operators and collection filters now show factions, including all main, sub and hidden factions from latest game updates",
      "Roster statistics: some interesting numbers about your or other people rosters are now visible in View Profile dialog",
      "More fixes and tweaks",
      [
        "You can now easily copy your u/user krooster url: from input, collection and profile pages",
        "Fixed some needed calculations in depot, when used with upcoming materials",
        "Import: More detailed Email warnings for new users, with step-by-steb fix guide for most common import problem"
      ]
    ],
  },
  {
    version: "3.3.3",
    date: "October 03, 2025",
    title: "Planner Upgrades and QoLs",
    content: ["Goals sync on import, ordered calculation and more"],
    changelog: [
      "Goals",
      [
        "Can be auto updated & cleared after account import or from planner page menus",
        "Ordered calculations mode to process the goal list from first to last, and new operator indicators to help you see where materials will actually run out",
      ],
      "Summary & Upcoming Events",
      [
      "Summary with ordered calculation mode now shows material crafting grouped in your operators order from goals list",
      "Crafting materials directly from ordered summary - click on +1. And its safeguarded from wasting materials of previous operator",
      "Upcoming events are now interated in all planner and its now possible to disable any of them in list on the fly",
      ],
      "Also previous updates include",
      [
        "More filters for operators: class Branches, Pools, Masteries, Modules and Skill levels",
        "Various bugfixes and optimizations"
      ]
    ],
  },
  {
    version: "3.3.2",
    date: "April 28, 2025",
    title: "Importing is Back",
    content: ["We've updated the import system to work with the new login method."],
    changelog: [
      "You can also import accounts from the KR and JP servers.",
      "Existing tokens have been invalidated, so you will need to re-authenticate.",
    ],
  },
  {
    version: "3.3.1",
    date: "April 25, 2025",
    title: "Minor Tweaks and Fixes",
    content: ["Routine maintenance."],
    changelog: [
      "The recruitment calculator has been updated to match the new game version.",
      "We've migrated most of the remaining images on the site to the new CDN.",
      "Some event data is now pre-filled in the planner's event tracker.",
    ],
  },
  {
    version: "3.3.0",
    date: "April 14, 2025",
    title: "New CDN, OGP embeds, profile colors, and better Recruitment",
    content: ["We've got a lot of big changes for you."],
    changelog: [
      "New CDN",
      [
        "As part of my ongoing efforts to reduce monthly costs, Krooster now uses a new CDN.",
        "Hopefully, this change should not impact you. If you notice any issues, please let me know.",
      ],
      "OGP Embeds",
      [
        "We're playing around with a new experiment, and this is subject to change or removal.",
        "User lookup pages now have OGP embeds - direct profile links now have a preview of the profile attached on platforms like Discord.",
      ],
      "Colors!",
      ["You can now add a color to your profile. This color will be used on your lookup page and in the OGP embed."],
      "Recruitment Calculator",
      [
        "You can now choose to hide recruitment tags that don't contain any rare operators.",
        "You can also now update your operator's potentials directly from the recruitment screen. You will have to be logged in to do this.",
      ],
      "Unfortunately, due to the login changes on Yostar's side, the import feature is currently broken.",
      ["We're optimistic that fixing this won't take too long, but we're not sure when it will be back."],
      "We are also currently discussing sponsorship for Krooster to help with the funding issues.",
    ],
  },
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
