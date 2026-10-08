import { KONFHUB_URL, CF_CALL_FOR_PROPOSALS_URL } from '../constants';

export const eventData = {
  name: "AWS Community Day",
  edition: "Udaipur '26",
  year: "2026",
  date: "February 28, 2026",
  dateFormatted: "FEB 28, 2026",
  day: "Saturday",
  venue: {
    name: "Geetanjali Institute of Technical Studies",
    shortName: "GITS, Udaipur",
    address: "Airport Road, Dabok, Udaipur, Rajasthan 313022",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    coordinates: "24.6174° N, 73.8824° E",
    mapUrl: "https://maps.google.com/?q=Geetanjali+Institute+of+Technical+Studies+Udaipur"
  },
  tagline: "WHERE CLOUD MEETS COMMUNITY.",
  subHeadline: "SAME CITY • NEW PERSPECTIVES • BIGGER IDEAS",
  registrationUrl: KONFHUB_URL,
  cfpUrl: CF_CALL_FOR_PROPOSALS_URL,
  stats: [
    { value: "1,200+", label: "Cloud Builders & Architects" },
    { value: "24+", label: "Technical Deep Dives" },
    { value: "3", label: "Parallel Tracks" },
    { value: "100%", label: "Community Driven" }
  ],
  socials: {
    twitter: "https://x.com/awsugudaipur",
    linkedin: "https://linkedin.com/company/aws-user-group-udaipur",
    discord: "https://discord.gg/awsugindia",
    github: "https://github.com/aws-community-udaipur"
  }
};
