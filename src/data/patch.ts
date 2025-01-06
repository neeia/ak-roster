const patch = [
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
      "We're migrating to a new account management system. You will not need to make a new account, but you will need to verify your email to log in.",
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
