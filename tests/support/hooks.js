const { Before, After, BeforeStep, AfterStep, BeforeAll, AfterAll } = require('@cucumber/cucumber');

BeforeAll(function() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           PICTIONARY GAME - TEST SUITE STARTING            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
});

Before(function(scenario) {
  console.log('\n┌────────────────────────────────────────────────────────────────┐');
  console.log(`│ 🎬 SCENARIO: ${scenario.pickle.name}`);
  console.log('└────────────────────────────────────────────────────────────────┘');
});

BeforeStep(function(step) {
  const stepType = step.pickleStep.type;
  const stepText = step.pickleStep.text;
  const emoji = {
    'Context': '📋',
    'Action': '▶️',
    'Outcome': '✓'
  }[stepType] || '•';
  
  console.log(`  ${emoji} ${stepType}: ${stepText}`);
});

AfterStep(function(step) {
  if (step.result.status === 'PASSED') {
    console.log(`     ✅ PASSED`);
  } else if (step.result.status === 'FAILED') {
    console.log(`     ❌ FAILED: ${step.result.message}`);
  } else if (step.result.status === 'SKIPPED') {
    console.log(`     ⏭️  SKIPPED`);
  }
});

After(function(scenario) {
  const status = scenario.result.status;
  const emoji = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⚠️';
  
  console.log('\n┌────────────────────────────────────────────────────────────────┐');
  console.log(`│ ${emoji} SCENARIO ${status}: ${scenario.pickle.name}`);
  console.log('└────────────────────────────────────────────────────────────────┘\n');
});

AfterAll(function() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           PICTIONARY GAME - TEST SUITE COMPLETED           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
});
