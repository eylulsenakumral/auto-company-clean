"use strict";
/**
 * Email Templates Parser
 * Parses templates from docs/marketing/email-outreach-sequence.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateManager  void 0;
// Direct template definitions (parsed from markdown)
var TEMPLATES  {
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
        body: "Hi [Name],\n\nHope you're doing well!\n\nI built a small tool that solves a problem I kept seeing \u2014 qualified candidates getting rejected by ATS systems before a human even sees their resume.\n\nIt's a Resume Keyword Gap Analyzer. You upload your resume, paste a job description, and it shows you exactly which keywords you're missing.\n\n**The tool is in beta, and I'd love your feedback.**\n\nCould you try it and tell me:\n1. Was it clear how to use?\n2. Were the results useful?\n3. What would make it better?\n\n**Link:** https://nonhereditary-valentina-admissibly.ngrok-free.dev\n\nAs a thank you for testing, you'll get free lifetime access once we launch.\n\nTakes 5 minutes. No signup required, 100% private (everything runs in browser).\n\nWould really appreciate your thoughts.\n\nBest,\nTolga"
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
        body: "Hi [Name],\n\nQuick question: Did you know 75% of resumes are rejected by ATS systems before a human ever reads them?\n\nI kept seeing talented friends get rejected because their resume didn't have the \"right\" keywords \u2014 even when they were perfect for the role.\n\nSo I built a fix.\n\n**Resume Keyword Gap Analyzer:**\n- Upload your resume\n- Paste the job description\n- See exactly which keywords you're missing\n\nIt's in beta, and I'm looking for feedback from people actually job hunting.\n\n**Try it here:** https://nonhereditary-valentina-admissibly.ngrok-free.dev\n\nIf you test it and share your thoughts, you get free lifetime access.\n\nNo signup, totally private (nothing leaves your browser), takes 5 minutes.\n\nWhat do you think?\n\nBest,\nTolga"
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
        body: "Hey [Name],\n\nWorking on a side project and would value your opinion.\n\nI built a Resume Keyword Gap Analyzer \u2014 it compares your resume against job descriptions and shows you which keywords you're missing.\n\nWhy? Because ATS robots reject 75% of resumes before a human sees them, and most of the time it's just a keyword mismatch.\n\n**The tool:** https://nonhereditary-valentina-admissibly.ngrok-free.dev\n\nIt's beta. It's rough around the edges. But it works.\n\n**Can you try it and tell me:**\n- Was it useful?\n- Confusing?\n- What would you add?\n\nIn exchange: free lifetime access for anyone who tests and gives feedback.\n\nNo signup, private, 5 minutes max.\n\nThanks in advance \u2014 really appreciate it.\n\nTolga"
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
        body: "Hi [Name],\n\nJust bumping this in case it got buried.\n\nI'm still looking for feedback on the Resume Keyword Gap Analyzer I mentioned earlier.\n\n**Link:** https://nonhereditary-valentina-admissibly.ngrok-free.dev\n\nIf you can spare 5 minutes to test it, I'd really appreciate your thoughts. And the free lifetime access offer stands for anyone who helps me improve it.\n\nNo pressure at all \u2014 just thought it might be useful for you (or someone you know who's job hunting).\n\nBest,\nTolga"
    }
};
var PERSONALIZED_OPENERS  [
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
var TemplateManager  /** @class */ (function () {
    function TemplateManager() {
    }
    TemplateManager.prototype.getTemplate  function (id) {
        return TEMPLATES[id] || null;
    };
    TemplateManager.prototype.getAllTemplates  function () {
        return Object.values(TEMPLATES).sort(function (a, b) { return a.id - b.id; });
    };
    TemplateManager.prototype.getPersonalizedOpeners  function () {
        return PERSONALIZED_OPENERS;
    };
    TemplateManager.prototype.renderTemplate  function (template, recipient, subjectIndex) {
        var subject  subjectIndex ! undefined
            ? template.subjects[subjectIndex % template.subjects.length]
            : template.subjects[Math.floor(Math.random() * template.subjects.length)];
        var body  template.body;
        // Replace placeholders
        body  body.replace(/\[Name\]/g, recipient.name || 'there');
        // Add personalized opener if specified
        if (recipient.personalizedOpener) {
            var openerLine  recipient.personalizedOpener.replace(/\[Name\]/g, recipient.name || 'there');
            body  openerLine + '\n\n' + body.split('\n').slice(1).join('\n');
        }
        // Convert to HTML
        var html  this.textToHtml(body);
        return { subject: subject, html: html };
    };
    TemplateManager.prototype.textToHtml  function (text) {
        var lines  text.split('\n');
        var html  '';
        for (var _i  0, lines_1  lines; _i < lines_1.length; _i++) {
            var line  lines_1[_i];
            if (line.trim()  '') {
                html + '<br>\n';
            }
            else if (line.startsWith('**')) {
                html + "<strong>".concat(line.replace(/\*\*/g, ''), "</strong><br>\n");
            }
            else if (line.startsWith('- ')) {
                html + "&nbsp;&nbsp;&nbsp;\u2022 ".concat(line.slice(2), "<br>\n");
            }
            else if (line.match(/^\d+\./)) {
                html + "&nbsp;&nbsp;&nbsp;".concat(line, "<br>\n");
            }
            else {
                html + "".concat(line, "<br>\n");
            }
        }
        return html;
    };
    return TemplateManager;
}());
exports.TemplateManager  TemplateManager;
