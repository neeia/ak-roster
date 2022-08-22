const config = {
  siteTitle: "AK Rooster",
  siteUrl: "https://krooster.com/",
  siteDescription:
    "A collection and progress tracker for Arknights, a game developed by Hypergryph.",
  tabs: {
    "/data": {
      title: "Data",
      description: "Data things",
      pages: {
        "/input": {
          title: "Input",
          description: "Enter data about your operators.",
        },
        "/view": {
          title: "Collection",
          description: "Collect things",
        }
      }
    },
    "/account": {
      title: "Account",
      description: "Account for things",
      pages: {
        "/profile": {
          title: "Profile",
          description: "Pro files",
          requireLogin: true,
        },
        "/settings": {
          title: "Settings",
          description: "Set things",
          requireLogin: true,
        }
      }
    },
    "/network": {
      title: "Network",
      description: "Networking opportunites",
      pages: {
        "/lookup": {
          title: "Lookup",
          description: "Look up people",
        },
        "/headhunt": {
          title: "Headhunt",
          description: "Look up units",
          requireLogin: true,
        }
      }
    },
  },
};
export default config;