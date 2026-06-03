// /home/tolgabrk/projects/Auto-Company/automation/tests/test-6-full-e2e.js
const { createClient } ***REMOVED*** require('@supabase/supabase-js');
const http ***REMOVED*** require('http');

const supabase ***REMOVED*** createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function runFullE2E() {
  console.log('🧪 TEST 6: Full E2E Outreach Simulation\n');
  console.log('This test simulates: Prospect → Email → Click → Demo Booking\n');

  let prospectId ***REMOVED*** null;
  let companyId ***REMOVED*** null;

  try {
    // ***REMOVED******REMOVED******REMOVED*** STEP 1: Create prospect ***REMOVED******REMOVED******REMOVED***
    console.log('📝 STEP 1: Creating prospect...');
    const { data: prospect, error: createError } ***REMOVED*** await supabase
      .from('prospects')
      .insert([{
        company_name: 'E2E Test Company',
        tier: 'tier-1',
        contact_email: 'e2e-test@example.com',
        contact_name: 'E2E Decision Maker',
        contact_phone: '+905559998877',
        status: 'cold',
        phase: 'Phase 1',
        email_bounced: false,
        email_suppressed: false
      }])
      .select()
      .single();

    if (createError) throw createError;
    prospectId ***REMOVED*** prospect.id;
    console.log(`✅ Prospect created: ${prospect.id}`);

    // ***REMOVED******REMOVED******REMOVED*** STEP 2: Send email ***REMOVED******REMOVED******REMOVED***
    console.log('\n📧 STEP 2: Sending initial email...');
    const workerResponse ***REMOVED*** await fetch(
      'https://nextvision-outreach-worker.workers.dev/trigger',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }
    );

    if (!workerResponse.ok) {
      throw new Error(`Worker failed: ${workerResponse.status}`);
    }

    const workerResult ***REMOVED*** await workerResponse.json();
    console.log('✅ Email sent via worker');
    console.log(`   - Processed: ${workerResult.summary.companiesProcessed}`);
    console.log(`   - Sent: ${workerResult.summary.emailsSent}`);

    // Wait for DB update
    await new Promise(resolve ***REMOVED***> setTimeout(resolve, 2000));

    // Verify prospect updated
    const { data: updatedProspect } ***REMOVED*** await supabase
      .from('prospects')
      .select('*')
      .eq('id', prospectId)
      .single();

    if (!updatedProspect.email_sent || updatedProspect.status !***REMOVED******REMOVED*** 'contacted') {
      throw new Error('Email not recorded in prospect');
    }

    console.log('✅ Prospect status updated to "contacted"');

    // ***REMOVED******REMOVED******REMOVED*** STEP 3: Simulate email open ***REMOVED******REMOVED******REMOVED***
    console.log('\n👀 STEP 3: Simulating email open event...');
    const openEvent ***REMOVED*** [{
      email: 'e2e-test@example.com',
      event: 'open',
      sg_event_id: 'e2e_open_123',
      timestamp: Math.floor(Date.now() / 1000)
    }];

    await sendWebhookEvent(openEvent);
    await new Promise(resolve ***REMOVED***> setTimeout(resolve, 1000));

    const { data: afterOpen } ***REMOVED*** await supabase
      .from('prospects')
      .select('*')
      .eq('id', prospectId)
      .single();

    if (afterOpen.email_status !***REMOVED******REMOVED*** 'opened') {
      throw new Error('Open event not recorded');
    }

    console.log('✅ Email open recorded');
    console.log(`   - Opens: ${afterOpen.email_open_count || 1}`);

    // ***REMOVED******REMOVED******REMOVED*** STEP 4: Simulate link click ***REMOVED******REMOVED******REMOVED***
    console.log('\n🖱️  STEP 4: Simulating link click...');
    const clickEvent ***REMOVED*** [{
      email: 'e2e-test@example.com',
      event: 'click',
      sg_event_id: 'e2e_click_456',
      timestamp: Math.floor(Date.now() / 1000),
      url: 'https://nextvision.ai/demo?utm_source***REMOVED***outreach&utm_medium***REMOVED***email'
    }];

    await sendWebhookEvent(clickEvent);
    await new Promise(resolve ***REMOVED***> setTimeout(resolve, 1000));

    const { data: afterClick } ***REMOVED*** await supabase
      .from('prospects')
      .select('*')
      .eq('id', prospectId)
      .single();

    if (afterClick.email_status !***REMOVED******REMOVED*** 'clicked') {
      throw new Error('Click event not recorded');
    }

    console.log('✅ Link click recorded');
    console.log(`   - Clicks: ${afterClick.email_click_count || 1}`);
    console.log(`   - URL: ${afterClick.email_clicked_url}`);

    // ***REMOVED******REMOVED******REMOVED*** STEP 5: Simulate demo booking ***REMOVED******REMOVED******REMOVED***
    console.log('\n📅 STEP 5: Recording demo booking...');
    const { data: demo, error: demoError } ***REMOVED*** await supabase
      .from('demo_bookings')
      .insert([{
        prospect_id: prospectId,
        scheduled_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: 'scheduled',
        created_by: 'e2e-test-automation'
      }])
      .select()
      .single();

    if (demoError) throw demoError;
    console.log('✅ Demo booked');
    console.log(`   - Demo ID: ${demo.id}`);
    console.log(`   - Scheduled: ${demo.scheduled_at}`);

    // ***REMOVED******REMOVED******REMOVED*** STEP 6: Update prospect to warm ***REMOVED******REMOVED******REMOVED***
    console.log('\n🔥 STEP 6: Updating prospect to "warm"...');
    const { data: warmProspect } ***REMOVED*** await supabase
      .from('prospects')
      .update({
        status: 'warm',
        phase: 'Phase 2',
        demo_booked: true,
        demo_scheduled_at: demo.scheduled_at
      })
      .eq('id', prospectId)
      .select()
      .single();

    console.log('✅ Prospect advanced to warm lead');
    console.log(`   - Status: ${warmProspect.status}`);
    console.log(`   - Phase: ${warmProspect.phase}`);

    // ***REMOVED******REMOVED******REMOVED*** STEP 7: Verify daily metrics ***REMOVED******REMOVED******REMOVED***
    console.log('\n📊 STEP 7: Verifying daily metrics...');
    const today ***REMOVED*** new Date().toISOString().split('T')[0];
    const { data: metrics } ***REMOVED*** await supabase
      .from('daily_metrics')
      .select('*')
      .eq('date', today)
      .single();

    if (!metrics) {
      console.warn('⚠️  No daily metrics found (may need manual trigger)');
    } else {
      console.log('✅ Daily metrics tracked');
      console.log(`   - Emails sent: ${metrics.emails_sent}`);
      console.log(`   - Demos booked: ${metrics.demos_booked || 0}`);
    }

    // ***REMOVED******REMOVED******REMOVED*** TEST COMPLETE ***REMOVED******REMOVED******REMOVED***
    console.log('\n🎉 TEST 6 PASSED: Full E2E journey completed successfully');
    console.log('\n📋 Journey Summary:');
    console.log('   1. ✅ Prospect created (cold → contacted)');
    console.log('   2. ✅ Email sent and logged');
    console.log('   3. ✅ Email opened');
    console.log('   4. ✅ Link clicked');
    console.log('   5. ✅ Demo booked');
    console.log('   6. ✅ Prospect warmed (Phase 1 → Phase 2)');

    console.log('\n🧹 Cleanup command:');
    console.log(`   curl -X DELETE "$SUPABASE_URL/rest/v1/prospects?id***REMOVED***eq.${prospectId}" \\`);
    console.log('     -H "apikey: $SUPABASE_SERVICE_KEY"');

    return true;

  } catch (error) {
    console.error('\n❌ TEST 6 FAILED:', error.message);

    // Emergency cleanup
    if (prospectId) {
      console.log('🧹 Emergency cleanup...');
      await supabase.from('prospects').delete().eq('id', prospectId);
    }

    return false;
  }
}

async function sendWebhookEvent(events) {
  return new Promise((resolve, reject) ***REMOVED***> {
    const data ***REMOVED*** JSON.stringify(events);

    const options ***REMOVED*** {
      hostname: 'localhost',
      port: 3000,
      path: '/api/webhooks/sendgrid',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req ***REMOVED*** http.request(options, (res) ***REMOVED***> {
      let body ***REMOVED*** '';
      res.on('data', chunk ***REMOVED***> body +***REMOVED*** chunk);
      res.on('end', () ***REMOVED***> {
        try {
          const response ***REMOVED*** JSON.parse(body);
          resolve(response);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

runFullE2E().then(success ***REMOVED***> {
  process.exit(success ? 0 : 1);
});