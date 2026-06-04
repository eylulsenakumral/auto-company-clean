#!/usr/bin/env python3
"""
Prospects Tracker Automation
Simple metrics calculator for NextVision Week 1 outreach
No external dependencies - pure Python

Usage:
    python docs/fullstack/prospects_automation.py
"""

import csv
from datetime import datetime, date
from pathlib import Path

# Paths
TRACKER_PATH ***REMOVED*** Path(__file__).parent.parent / "sales" / "prospects_tracker.csv"
TEMPLATE_PATH ***REMOVED*** Path(__file__).parent.parent / "sales" / "prospects_tracker_template.csv"

def load_tracker():
    """Load prospects tracker CSV"""
    path ***REMOVED*** TRACKER_PATH if TRACKER_PATH.exists() else TEMPLATE_PATH

    with open(path, 'r', encoding***REMOVED***'utf-8') as f:
        reader ***REMOVED*** csv.DictReader(f)
        return list(reader)

def calculate_metrics(prospects):
    """Calculate outreach metrics"""
    # Filter out sample rows (empty company names)
    active ***REMOVED*** [p for p in prospects if p.get('Company') and p['Company'].strip()]

    total ***REMOVED*** len(active)

    # Funnel metrics
    touched ***REMOVED*** [p for p in active if p.get('Touches') and int(p['Touches']) > 0]
    replied ***REMOVED*** [p for p in active if p.get('Status') ***REMOVED******REMOVED*** 'replied']
    booked ***REMOVED*** [p for p in active if p.get('Pilot_Booked') ***REMOVED******REMOVED*** 'TRUE']
    lost ***REMOVED*** [p for p in active if p.get('Status') ***REMOVED******REMOVED*** 'lost']

    # Reply rate calculation
    reply_rate ***REMOVED*** len(replied) / len(touched) if len(touched) > 0 else 0

    # Conversion rate calculation
    conversion_rate ***REMOVED*** len(booked) / len(replied) if len(replied) > 0 else 0

    # Average time to reply
    reply_times ***REMOVED*** []
    for p in replied:
        if p.get('Time_To_Reply_Hours'):
            try:
                reply_times.append(float(p['Time_To_Reply_Hours']))
            except:
                pass

    avg_reply_time ***REMOVED*** sum(reply_times) / len(reply_times) if reply_times else None

    return {
        'total_prospects': total,
        'touched': len(touched),
        'replied': len(replied),
        'booked': len(booked),
        'lost': len(lost),
        'reply_rate': reply_rate,
        'conversion_rate': conversion_rate,
        'avg_reply_hours': avg_reply_time,
        'prospects': active,
    }

def print_daily_summary(metrics):
    """Print daily metrics summary"""
    print(f"\n{'***REMOVED***'*60}")
    print(f"NextVision Week 1 - Outreach Metrics")
    print(f"Date: {date.today().strftime('%Y-%m-%d')}")
    print(f"{'***REMOVED***'*60}\n")

    print(f"📊 Funnel Overview")
    print(f"  Total Prospects:    {metrics['total_prospects']}")
    if metrics['total_prospects'] > 0:
        print(f"  Touched:            {metrics['touched']} ({metrics['touched']/metrics['total_prospects']*100:.1f}%)")
    else:
        print(f"  Touched:            {metrics['touched']}")

    if metrics['touched'] > 0:
        print(f"  Replied:            {metrics['replied']} ({metrics['reply_rate']*100:.1f}% of touched)")
    else:
        print(f"  Replied:            {metrics['replied']}")

    if metrics['replied'] > 0:
        print(f"  Booked:             {metrics['booked']} ({metrics['conversion_rate']*100:.1f}% of replied)")
    else:
        print(f"  Booked:             {metrics['booked']}")

    print(f"  Lost:               {metrics['lost']}")

    print(f"\n📈 Key Metrics")
    print(f"  Reply Rate:         {metrics['reply_rate']*100:.1f}%")
    print(f"  Conversion Rate:   {metrics['conversion_rate']*100:.1f}%")
    if metrics['avg_reply_hours']:
        print(f"  Avg Reply Time:    {metrics['avg_reply_hours']:.1f} hours")

    print(f"\n💡 Next Actions")
    if metrics['reply_rate'] < 0.15:
        print("  ⚠️  Reply rate below 15% - consider message pivot")
    elif metrics['reply_rate'] > 0.25:
        print("  ✅ Reply rate healthy - continue current approach")
    else:
        print("  📊 Reply rate in target range - monitor trend")

    if metrics['booked'] ***REMOVED******REMOVED*** 0:
        print("  ⚠️  No bookings yet - focus on reply-to-call conversion")
    else:
        print(f"  ✅ {metrics['booked']} booking(s) - nurture pipeline")

    print(f"\n{'***REMOVED***'*60}\n")

def analyze_sources(metrics):
    """Analyze performance by source"""
    active ***REMOVED*** metrics['prospects']

    if not active:
        return

    sources ***REMOVED*** {}
    for p in active:
        source ***REMOVED*** p.get('Source', 'Unknown')
        if source not in sources:
            sources[source] ***REMOVED*** {'total': 0, 'replied': 0}
        sources[source]['total'] +***REMOVED*** 1
        if p.get('Status') ***REMOVED******REMOVED*** 'replied':
            sources[source]['replied'] +***REMOVED*** 1

    if not sources:
        return

    print("📂 Performance by Source")
    for source, data in sources.items():
        reply_rate ***REMOVED*** (data['replied'] / data['total']) if data['total'] > 0 else 0
        print(f"  {source}: {data['total']} prospects, {reply_rate*100:.1f}% reply rate")
    print()

def analyze_touch_effectiveness(metrics):
    """Analyze which touch number generates replies"""
    active ***REMOVED*** metrics['prospects']

    if not active:
        return

    print("🎯 Touch Effectiveness")

    # Count touches and replies
    touch1_sent ***REMOVED*** len([p for p in active if p.get('Touch_1_Sent') ***REMOVED******REMOVED*** 'TRUE'])
    touch2_sent ***REMOVED*** len([p for p in active if p.get('Touch_2_Sent') ***REMOVED******REMOVED*** 'TRUE'])
    touch3_sent ***REMOVED*** len([p for p in active if p.get('Touch_3_Sent') ***REMOVED******REMOVED*** 'TRUE'])

    # Count replies at each stage
    touch1_replied ***REMOVED*** len([p for p in active if p.get('Touch_1_Sent') ***REMOVED******REMOVED*** 'TRUE' and p.get('Status') ***REMOVED******REMOVED*** 'replied'])
    touch2_replied ***REMOVED*** len([p for p in active if p.get('Touch_2_Sent') ***REMOVED******REMOVED*** 'TRUE' and p.get('Status') ***REMOVED******REMOVED*** 'replied'])
    touch3_replied ***REMOVED*** len([p for p in active if p.get('Touch_3_Sent') ***REMOVED******REMOVED*** 'TRUE' and p.get('Status') ***REMOVED******REMOVED*** 'replied'])

    t1_rate ***REMOVED*** (touch1_replied / touch1_sent) if touch1_sent > 0 else 0
    t2_rate ***REMOVED*** (touch2_replied / touch2_sent) if touch2_sent > 0 else 0
    t3_rate ***REMOVED*** (touch3_replied / touch3_sent) if touch3_sent > 0 else 0

    print(f"  Touch 1: {touch1_sent} sent, {touch1_replied} replied ({t1_rate*100:.1f}%)")
    print(f"  Touch 2: {touch2_sent} sent, {touch2_replied} replied ({t2_rate*100:.1f}%)")
    print(f"  Touch 3: {touch3_sent} sent, {touch3_replied} replied ({t3_rate*100:.1f}%)")
    print()

def main():
    """Main execution"""
    prospects ***REMOVED*** load_tracker()
    metrics ***REMOVED*** calculate_metrics(prospects)

    print_daily_summary(metrics)
    analyze_sources(metrics)
    analyze_touch_effectiveness(metrics)

    # Export weekly snapshot (Fridays)
    if date.today().weekday() ***REMOVED******REMOVED*** 4:  # Friday
        snapshot_path ***REMOVED*** Path(__file__).parent.parent / "sales" / f"prospects_week1_{date.today().strftime('%Y%m%d')}.csv"
        with open(snapshot_path, 'w', encoding***REMOVED***'utf-8') as f:
            fieldnames ***REMOVED*** prospects[0].keys() if prospects else ['ID']
            writer ***REMOVED*** csv.DictWriter(f, fieldnames***REMOVED***fieldnames)
            writer.writeheader()
            writer.writerows(prospects)
        print(f"📸 Weekly snapshot saved: {snapshot_path}")

if __name__ ***REMOVED******REMOVED*** "__main__":
    main()
