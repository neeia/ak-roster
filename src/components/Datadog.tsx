import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
    applicationId: 'b868a7ba-5305-48b3-a21b-414a10492cd5',
    clientToken: 'pub57c1c3b811784646b7e966e81c147701',
    // `site` refers to the Datadog site parameter of your organization
    // see https://docs.datadoghq.com/getting_started/site/
    site: 'us3.datadoghq.com',
    service: 'oh-ok-',
    env: 'production',
    // Specify a version number to identify the deployed version of your application in Datadog
    version: '2.6.14',
    sessionSampleRate: 10,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
});


export default function DatadogInit() {
  // Render nothing - this component is only included so that the init code
  // above will run client-side
  return null;
}