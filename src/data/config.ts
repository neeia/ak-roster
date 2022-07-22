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
        },
        "/settings": {
          title: "Settings",
          description: "Set things",
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
        }
      }
    },
  },
};
export default config;