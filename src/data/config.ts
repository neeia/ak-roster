const config = {
  siteTitle: "Krooster",
  siteUrl: "https://krooster.com/",
  siteDescription:
    "A collection and progress tracker for Arknights, a game developed by Hypergryph.",
  tabs: {
    "/data": {
      title: "Data",
      description: "Input and Review Data",
      pages: {
        "/input": {
          title: "Input",
          description: "Enter data about owned operators.",
          requireLogin: true,
        },
        "/view": {
          title: "Collection",
          description: "View a summary of operator data.",
          requireLogin: true,
        }
      }
    },
    "/account": {
      title: "Account",
      description: "Modify Account Details",
      pages: {
        "/profile": {
          title: "Profile",
          description: "Share your in-game Doctor information.",
          requireLogin: true,
        },
        "/settings": {
          title: "Settings",
          description: "Make changes to account details.",
          requireLogin: true,
        }
      }
    },
    "/network": {
      title: "Network",
      description: "Krooster Community",
      pages: {
        "/lookup": {
          title: "Lookup",
          description: "Find other users.",
        },
      }
    },
    "/tools": {
      title: "Tools",
      description: "Calculators and Tools",
      pages: {
        "/recruit": {
          title: "Recruitment",
          description: "See what pool of operators are available from your tags in Recruitment.",
        },
        "/rateup": {
          title: "Headhunting",
          description: "Calculate the probability of pulling operators on a gacha banner.",
        },
        "/level": {
          title: "Level Costs",
          description: "Calculate LMD and EXP costs to level operators.",
        }
      }
    },
    "/planner": {
      title: "Planner",
      description: "Material calculator",
      pages: {
        "/goals": {
          title: "Goals",
          description: "Set goals for operators and calculate material costs.",
          requireLogin: true,
        },
      }
    },
  },
};
export default config;