/**
 * Email Templates Parser
 * Parses templates from docs/marketing/email-outreach-sequence.md
 */

import fs from 'fs';
import path from 'path';

export interface Template {
  id: number;
  name: string;
  subjects: string[];
  body: string;
}

export interface PersonalizedOpener {
  condition: string;
  opener: string;
}

// Direct template definitions (parsed from markdown)
const TEMPLATES: Record<number, Template> ***REMOVED*** {
  1: {
    id: 1,
    name: 'Can You Help?',
    subjects: [
      'Quick favor - 5 minutes max',
      'Built something for job seekers, can you test?',
      'Resume tool - need your feedback',
      'ATS rejection problem - I built a fix',
      'Beta access: Resume keyword analyzer'
    ],
    body: `Hi [Name],

Hope you're doing well!

I built a small tool that solves a problem I kept seeing — qualified candidates getting rejected by ATS systems before a human even sees their resume.

It's a Resume Keyword Gap Analyzer. You upload your resume, paste a job description, and it shows you exactly which keywords you're missing.

**The tool is in beta, and I'd love your feedback.**

Could you try it and tell me:
1. Was it clear how to use?
2. Were the results useful?
3. What would make it better?

**Link:** https://nonhereditary-valentina-admissibly.ngrok-free.dev

As a thank you for testing, you'll get free lifetime access once we launch.

Takes 5 minutes. No signup required, 100% private (everything runs in browser).

Would really appreciate your thoughts.

Best,
Tolga`
  },
  2: {
    id: 2,
    name: 'Problem-Solution',
    subjects: [
      '75% of resumes never reach a human',
      'ATS filters - here\'s a workaround',
      'Don\'t get filtered out by robots',
      'Resume keyword gaps - instant fix',
      'Job search tool I wish I had'
    ],
    body: `Hi [Name],

Quick question: Did you know 75% of resumes are rejected by ATS systems before a human ever reads them?

I kept seeing talented friends get rejected because their resume didn't have the "right" keywords — even when they were perfect for the role.

So I built a fix.

**Resume Keyword Gap Analyzer:**
- Upload your resume
- Paste the job description
- See exactly which keywords you're missing

It's in beta, and I'm looking for feedback from people actually job hunting.

**Try it here:** https://nonhereditary-valentina-admissibly.ngrok-free.dev

If you test it and share your thoughts, you get free lifetime access.

No signup, totally private (nothing leaves your browser), takes 5 minutes.

What do you think?

Best,
Tolga`
  },
  3: {
    id: 3,
    name: 'Founder-to-Network',
    subjects: [
      'Side project - need your eyes',
      'Built a tool, want your opinion',
      'Resume analyzer - beta test',
      'Quick feedback on my latest project',
      '5 minutes? Help me improve this'
    ],
    body: `Hey [Name],

Working on a side project and would value your opinion.

I built a Resume Keyword Gap Analyzer — it compares your resume against job descriptions and shows you which keywords you're missing.

Why? Because ATS robots reject 75% of resumes before a human sees them, and most of the time it's just a keyword mismatch.

**The tool:** https://nonhereditary-valentina-admissibly.ngrok-free.dev

It's beta. It's rough around the edges. But it works.

**Can you try it and tell me:**
- Was it useful?
- Confusing?
- What would you add?

In exchange: free lifetime access for anyone who tests and gives feedback.

No signup, private, 5 minutes max.

Thanks in advance — really appreciate it.

Tolga`
  },
  4: {
    id: 4,
    name: 'Follow-Up',
    subjects: [
      'Re: Resume tool - any thoughts?',
      'Bumping this - quick feedback?',
      'Still looking for beta testers',
      'Last call for free lifetime access',
      'Quick follow-up'
    ],
    body: `Hi [Name],

Just bumping this in case it got buried.

I'm still looking for feedback on the Resume Keyword Gap Analyzer I mentioned earlier.

**Link:** https://nonhereditary-valentina-admissibly.ngrok-free.dev

If you can spare 5 minutes to test it, I'd really appreciate your thoughts. And the free lifetime access offer stands for anyone who helps me improve it.

No pressure at all — just thought it might be useful for you (or someone you know who's job hunting).

Best,
Tolga`
  }
};

const PERSONALIZED_OPENERS: PersonalizedOpener[] ***REMOVED*** [
  {
    condition: 'actively_job_hunting',
    opener: 'Hi [Name], I saw you\'re looking for roles — wanted to share something that might help...'
  },
  {
    condition: 'tech_connection',
    opener: 'Hey [Name], I know you see a lot of resumes — would love your take on this tool...'
  },
  {
    condition: 'close_friend',
    opener: 'Hey [Name], remember you mentioned your brother was struggling with applications? Built something for that...'
  },
  {
    condition: 'product_dev_person',
    opener: 'Hi [Name], Would value your product/tech eyes on this — especially the UX...'
  }
];

export class TemplateManager {
  getTemplate(id: number): Template | null {
    return TEMPLATES[id] || null;
  }

  getAllTemplates(): Template[] {
    return Object.values(TEMPLATES).sort((a, b) ***REMOVED***> a.id - b.id);
  }

  getPersonalizedOpeners(): PersonalizedOpener[] {
    return PERSONALIZED_OPENERS;
  }

  renderTemplate(template: Template, recipient: Recipient, subjectIndex?: number): { subject: string; html: string } {
    const subject ***REMOVED*** subjectIndex !***REMOVED******REMOVED*** undefined
      ? template.subjects[subjectIndex % template.subjects.length]
      : template.subjects[Math.floor(Math.random() * template.subjects.length)];

    let body ***REMOVED*** template.body;

    // Replace placeholders
    body ***REMOVED*** body.replace(/\[Name\]/g, recipient.name || 'there');

    // Add personalized opener if specified
    if (recipient.personalizedOpener) {
      const openerLine ***REMOVED*** recipient.personalizedOpener.replace(/\[Name\]/g, recipient.name || 'there');
      body ***REMOVED*** openerLine + '\n\n' + body.split('\n').slice(1).join('\n');
    }

    // Convert to HTML
    const html ***REMOVED*** this.textToHtml(body);

    return { subject, html };
  }

  private textToHtml(text: string): string {
    const lines ***REMOVED*** text.split('\n');
    let html ***REMOVED*** '';

    for (const line of lines) {
      if (line.trim() ***REMOVED******REMOVED******REMOVED*** '') {
        html +***REMOVED*** '<br>\n';
      } else if (line.startsWith('**')) {
        html +***REMOVED*** `<strong>${line.replace(/\*\*/g, '')}</strong><br>\n`;
      } else if (line.startsWith('- ')) {
        html +***REMOVED*** `&nbsp;&nbsp;&nbsp;• ${line.slice(2)}<br>\n`;
      } else if (line.match(/^\d+\./)) {
        html +***REMOVED*** `&nbsp;&nbsp;&nbsp;${line}<br>\n`;
      } else {
        html +***REMOVED*** `${line}<br>\n`;
      }
    }

    return html;
  }
}

export interface Recipient {
  email: string;
  name: string;
  segment?: string;
  personalizedOpener?: string;
  notes?: string;
}
