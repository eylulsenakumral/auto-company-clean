/**
 * Dashboard Home Page - Real-time Outreach Metrics
 */
import { useState, useEffect } from 'react';
import { supabase, subscribeToProspects, subscribeToCalls } from '../lib/supabase';

export default function Dashboard() {
  const [prospects, setProspects] ***REMOVED*** useState([]);
  const [metrics, setMetrics] ***REMOVED*** useState({
    totalProspects: 0,
    emailsSent: 0,
    emailsOpened: 0,
    emailsClicked: 0,
    callsMade: 0,
    callsConnected: 0,
    gatekeepers: 0,
    bookings: 0,
  });

  const [loading, setLoading] ***REMOVED*** useState(true);

  useEffect(() ***REMOVED***> {
    fetchData();

    // Real-time subscriptions
    const prospectsSubscription ***REMOVED*** subscribeToProspects((payload) ***REMOVED***> {
      console.log('Prospect update:', payload);
      fetchData();
    });

    const callsSubscription ***REMOVED*** subscribeToCalls((payload) ***REMOVED***> {
      console.log('Call update:', payload);
      fetchData();
    });

    return () ***REMOVED***> {
      prospectsSubscription.unsubscribe();
      callsSubscription.unsubscribe();
    };
  }, []);

  const fetchData ***REMOVED*** async () ***REMOVED***> {
    try {
      setLoading(true);

      // Fetch prospects
      const { data: prospectsData } ***REMOVED*** await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch calls
      const { data: callsData } ***REMOVED*** await supabase
        .from('calls')
        .select('*');

      setProspects(prospectsData || []);

      // Calculate metrics
      const metrics ***REMOVED*** {
        totalProspects: prospectsData?.length || 0,
        emailsSent: prospectsData?.filter(p ***REMOVED***> p.email_status ***REMOVED******REMOVED******REMOVED*** 'delivered').length || 0,
        emailsOpened: prospectsData?.filter(p ***REMOVED***> p.email_status ***REMOVED******REMOVED******REMOVED*** 'opened').length || 0,
        emailsClicked: prospectsData?.filter(p ***REMOVED***> p.email_status ***REMOVED******REMOVED******REMOVED*** 'clicked').length || 0,
        callsMade: callsData?.length || 0,
        callsConnected: callsData?.filter(c ***REMOVED***> c.call_status ***REMOVED******REMOVED******REMOVED*** 'completed').length || 0,
        gatekeepers: callsData?.filter(c ***REMOVED***> c.gatekeeper_detected).length || 0,
        bookings: prospectsData?.filter(p ***REMOVED***> p.status ***REMOVED******REMOVED******REMOVED*** 'booking_requested').length || 0,
      };

      setMetrics(metrics);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  const getStatusColor ***REMOVED*** (status) ***REMOVED***> {
    const colors ***REMOVED*** {
      'not_contacted': 'bg-gray-200',
      'email_sent': 'bg-blue-200',
      'email_opened': 'bg-green-200',
      'called': 'bg-yellow-200',
      'replied': 'bg-purple-200',
      'booking_requested': 'bg-emerald-200',
    };
    return colors[status] || 'bg-gray-200';
  };

  const getStatusLabel ***REMOVED*** (status) ***REMOVED***> {
    const labels ***REMOVED*** {
      'not_contacted': 'Not contacted',
      'email_sent': 'Email sent',
      'email_opened': 'Opened',
      'called': 'Called',
      'replied': 'Replied',
      'booking_requested': 'Booking',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className***REMOVED***"min-h-screen flex items-center justify-center">
        <div className***REMOVED***"text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className***REMOVED***"min-h-screen py-8">
      <div className***REMOVED***"container">
        {/* Header */}
        <div className***REMOVED***"mb-8">
          <h1 className***REMOVED***"text-3xl font-bold text-gray-900">Auto Company Outreach Dashboard</h1>
          <p className***REMOVED***"text-gray-600 mt-2">Real-time outreach metrics and tracking</p>
        </div>

        {/* Metrics Grid */}
        <div className***REMOVED***"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Email Metrics */}
          <MetricCard
            title***REMOVED***"Emails Sent"
            value***REMOVED***{metrics.emailsSent}
            total***REMOVED***{metrics.totalProspects}
            color***REMOVED***"blue"
          />
          <MetricCard
            title***REMOVED***"Emails Opened"
            value***REMOVED***{metrics.emailsOpened}
            total***REMOVED***{metrics.emailsSent}
            color***REMOVED***"green"
          />
          <MetricCard
            title***REMOVED***"Emails Clicked"
            value***REMOVED***{metrics.emailsClicked}
            total***REMOVED***{metrics.emailsOpened}
            color***REMOVED***"purple"
          />
          <MetricCard
            title***REMOVED***"Response Rate"
            value***REMOVED***{`${metrics.emailsClicked > 0 ? Math.round((metrics.emailsClicked / metrics.totalProspects) * 100) : 0}%`}
            target***REMOVED***"10-15%"
            color***REMOVED***"emerald"
          />

          {/* Call Metrics */}
          <MetricCard
            title***REMOVED***"Calls Made"
            value***REMOVED***{metrics.callsMade}
            total***REMOVED***{metrics.totalProspects}
            color***REMOVED***"yellow"
          />
          <MetricCard
            title***REMOVED***"Calls Connected"
            value***REMOVED***{metrics.callsConnected}
            total***REMOVED***{metrics.callsMade}
            color***REMOVED***"blue"
          />
          <MetricCard
            title***REMOVED***"Gatekeepers"
            value***REMOVED***{metrics.gatekeepers}
            total***REMOVED***{metrics.callsMade}
            color***REMOVED***"red"
          />
          <MetricCard
            title***REMOVED***"Bookings"
            value***REMOVED***{metrics.bookings}
            total***REMOVED***{metrics.callsConnected}
            color***REMOVED***"emerald"
          />
        </div>

        {/* Funnel Chart */}
        <div className***REMOVED***"bg-white rounded-lg shadow p-6 mb-8">
          <h2 className***REMOVED***"text-xl font-semibold mb-4">Outreach Funnel</h2>
          <FunnelChart metrics***REMOVED***{metrics} />
        </div>

        {/* Prospects Table */}
        <div className***REMOVED***"bg-white rounded-lg shadow overflow-hidden">
          <div className***REMOVED***"p-6 border-b border-gray-200">
            <h2 className***REMOVED***"text-xl font-semibold">Companies ({prospects.length})</h2>
          </div>
          <div className***REMOVED***"overflow-x-auto">
            <table className***REMOVED***"min-w-full divide-y divide-gray-200">
              <thead className***REMOVED***"bg-gray-50">
                <tr>
                  <th className***REMOVED***"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className***REMOVED***"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className***REMOVED***"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className***REMOVED***"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calls
                  </th>
                </tr>
              </thead>
              <tbody className***REMOVED***"bg-white divide-y divide-gray-200">
                {prospects.map((prospect) ***REMOVED***> (
                  <tr key***REMOVED***{prospect.id}>
                    <td className***REMOVED***"px-6 py-4 whitespace-nowrap">
                      <div className***REMOVED***"text-sm font-medium text-gray-900">{prospect.company}</div>
                    </td>
                    <td className***REMOVED***"px-6 py-4 whitespace-nowrap">
                      <div className***REMOVED***"text-sm text-gray-500">{prospect.email}</div>
                    </td>
                    <td className***REMOVED***"px-6 py-4 whitespace-nowrap">
                      <span className***REMOVED***{`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(prospect.status)}`}>
                        {getStatusLabel(prospect.status)}
                      </span>
                    </td>
                    <td className***REMOVED***"px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prospect.call_count || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({ title, value, total, target, color }) {
  const colors ***REMOVED*** {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
  };

  return (
    <div className***REMOVED***"bg-white rounded-lg shadow p-6">
      <h3 className***REMOVED***"text-sm font-medium text-gray-600">{title}</h3>
      <div className***REMOVED***"mt-2 flex items-baseline">
        <span className***REMOVED***{`text-3xl font-bold ${colors[color]} text-transparent bg-clip-text bg-gradient-to-r from-${color}-600 to-${color}-400`}>
          {value}
        </span>
        {total && (
          <span className***REMOVED***"ml-2 text-sm text-gray-500">/ {total}</span>
        )}
      </div>
      {target && (
        <div className***REMOVED***"mt-2 text-xs text-gray-500">
          Target: {target}
        </div>
      )}
    </div>
  );
}

/**
 * Funnel Chart Component
 */
function FunnelChart({ metrics }) {
  const stages ***REMOVED*** [
    { name: 'Emails Sent', value: metrics.emailsSent, color: 'bg-blue-500' },
    { name: 'Opened', value: metrics.emailsOpened, color: 'bg-green-500' },
    { name: 'Clicked', value: metrics.emailsClicked, color: 'bg-purple-500' },
    { name: 'Calls Made', value: metrics.callsMade, color: 'bg-yellow-500' },
    { name: 'Connected', value: metrics.callsConnected, color: 'bg-blue-400' },
    { name: 'Bookings', value: metrics.bookings, color: 'bg-emerald-500' },
  ];

  const maxValue ***REMOVED*** Math.max(...stages.map(s ***REMOVED***> s.value));

  return (
    <div className***REMOVED***"space-y-4">
      {stages.map((stage) ***REMOVED***> (
        <div key***REMOVED***{stage.name}>
          <div className***REMOVED***"flex justify-between text-sm mb-1">
            <span className***REMOVED***"font-medium">{stage.name}</span>
            <span className***REMOVED***"text-gray-600">{stage.value}</span>
          </div>
          <div className***REMOVED***"w-full bg-gray-200 rounded-full h-8">
            <div
              className***REMOVED***{`${stage.color} h-8 rounded-full flex items-center justify-center text-white text-xs font-medium`}
              style***REMOVED***{{ width: `${maxValue > 0 ? (stage.value / maxValue) * 100 : 0}%` }}
            >
              {maxValue > 0 ? `${Math.round((stage.value / maxValue) * 100)}%` : '0%'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
