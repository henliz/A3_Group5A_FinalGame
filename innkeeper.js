//innkeeper.js

const innkeeperDialogueByDay = {
  1: {
    name: "Mrs. Gustall",
    exitMonologue:
      "He seems too stressed to talk further… maybe I should try someone else.",
    opening:
      "Tsk, this is terrible. My inn's reputation will be ruined… What do you want girl?",
    repeatLine: "What is the issue? I am busy right now.",
    hesitationLine: "I don't have the energy to deal with them right now…",
    options: [
      {
        id: "A",
        cost: 2,
        playerLine: "I just wanted to know what happened, when you found her",
        npcResponse:
          "What I saw? I heard a scream, came out, and she was already — Just stay out of the way and let me handle this.",
        monologue:
          "She cut herself off. She was going to say something and decided not to. I don't know if pushing further would help or just make her angrier at me.",
        notebookEntry:
          "Heard the scream before finding her. Knows more than she's saying. Doesn't want guests involved.",
      },
      {
        id: "B",
        cost: 1,
        playerLine: "Are you okay?",
        npcResponse: "Of course not… Someone is dead",
        monologue:
          "That was the wrong question. Or maybe there wasn't a right one. I should have asked something real while I had the chance.",
        notebookEntry: null,
      },
      {
        id: "C",
        cost: 0,
        playerLine: "Sorry...Nevermind",
        npcResponse: "If you're not helping, don't get in the way.",
        monologue:
          "I had something to ask and I lost it the second she looked at me. Now I'm standing here and she's already looking through me like I'm not worth the attention. Maybe that's better. Maybe being invisible is safer right now.",
        notebookEntry: null,
        cost: 0,
      },
    ],
  },
  2: {
    name: "Mrs. Gustall",
    exitMonologue:
      "I didn't even finish the sentence. I need to talk to someone else.",
    opening: "Good morning. I hope you slept well despite everything.",
    repeatLine: "Any other questions you have?",
    hesitationLine: "I don't have the energy to deal with them right now…",
    options: [
      {
        id: "A",
        cost: 3,
        playerLine:
          "Yesterday, I saw a framed newspaper clipping of your donation to feed the hungry children organization, how did you get involved in that?",
        npcResponse:
          "Have you been snooping around my office?! It was bad enough Helen was always rustling around, and now you're rummaging through my business. Anyway. Don't ask me; my sister runs it in Oakdale.",
        npcResponse2: "But she doesn't need any more volunteers.",
        monologue:
          "This charity seems really weird. First the certificate looked odd, then she doesn't know details about a charity she donated $100,000 to, then she gives me the wrong location. Helen worked here and must have known about this fishy business, but would Ms. Gustall really kill her to keep Helen quiet?",
        notebookEntry:
          "The charity is based in Iverdale, not Oakdale. Helen would rummage in her office. Could she have found out about the charity?!",
      },
      {
        id: "B",
        cost: 2,
        playerLine:
          "Yesterday, I saw a framed newspaper clipping of your support of the hungry children organization, how can I get involved?",
        npcResponse:
          "Yeah, yeah. Is there something you actually need? I have a lot to get through today. My sister handles all of that. I just write the cheques.",
        monologue:
          "She dismissed it immediately. A hundred thousand dollar donation and she just writes the cheques. She didn't even ask why I was interested. I can feel her annoyance from here.",
        notebookEntry: '"I just write the cheques"',
      },
      {
        id: "C",
        cost: 1,
        playerLine:
          "Good morning Mrs. Gustall. I just wanted to check if everything was okay.",
        npcResponse: "I'm fine. Busy.",
        monologue:
          "Maybe I should talk with other guests. I can feel her annoyance already and I barely said anything.",
        notebookEntry: null,
      },
      {
        id: "D",
        cost: 0,
        playerLine: "Sorry to bother you again... [Exit]",
        npcResponse: "'Don't get in the way'",
        monologue:
          "I didn't even finish the sentence. I need to talk to someone else.",
        notebookEntry: null,
      },
    ],
  },
  3: {
    name: "Mrs. Gustall",
    exitMonologue:
      "I didn't even finish the sentence. I need to talk to someone else.",
    opening:
      "Deep breath… I can do this. I can't go to jail. Just a few questions, no big deal…",
    repeatLine: "Another question? What do you need?",
    hesitationLine: "I don't have the energy to deal with them right now…",
    options: [
      {
        id: "A",
        cost: 3,
        playerLine: "What were you doing the night of the murder?",
        npcResponse:
          "I checked up on the inn and make sure everything is stocked. That night, Helen was helping me organize some operational forms and documents earlier that evening...",
        npcResponse2:
          "so I checked up on her progress and dismissed her for the night. I turn in around 11pm every night. I was already asleep when the scream woke me up. I ran out...",
        npcResponse3:
          "to find Helen bleeding out on the ground. She was already dead when I found her. It was really strange, she had a few scratches on her face and chest...",
        npcResponse4:
          "I suspect that's what ultimately caused her death. But I can't explain the scratches. You saw how brutal it was. Helen had her faults but she didn't deserve to go that way. Yeah, she was really sweet in the short time I knew her...",
        monologue:
          "Faults? Like how she would snoop around Ms. Gustall's office? Ms. Gustall was the one who found her body, she seems to know Helen well and seems really upset but what if she's faking it?",
        notebookEntry:
          "Helen helped organize Mrs. Gustall's documents. She probably knew about her suspicious donation. Mrs. Gustall found her body.",
      },
      {
        id: "B",
        cost: 2,
        playerLine: "How long was Helen working here?",
        npcResponse:
          "She worked here for just under 2 years. She said she needed a job and my son just left, so I hired her. She was my employee. We had a very professional relationship. Ha! Not really...",
        npcResponse2:
          "She made a lot of mistakes and was always in everyone's business. But she was really friendly and the guests loved her. It's a shame how it ended.",
        monologue:
          "She seems upset about Helen's passing. But this confirms Helen's inquisitive nature.",
        notebookEntry:
          "Ms. Gustall knew Helen for ~2 years. She seems sad about her passing.",
      },
      {
        id: "C",
        cost: 1,
        playerLine: "Good morning, it was nice talking to you yesterday.",
        npcResponse:
          "Yeah, It was nice talking to you too. Is there something you need or can I get on with my day?",
        monologue:
          "Maybe I should talk with other guests. I can feel her annoyance already and I barely said anything.",
        notebookEntry: null,
      },
      {
        id: "D",
        cost: 0,
        playerLine: "Sorry…never mind [Exit]",
        npcResponse: "Annoyed look.",
        monologue:
          "I didn't even finish the sentence. I need to talk to someone else.",
        notebookEntry: null,
      },
    ],
  },
};

const innkeeper = new NPC(300, 400, innkeeperDialogueByDay[1]);
innkeeper.dialogueByDay = innkeeperDialogueByDay;
innkeeper.journalPageIndex = 1;
innkeeper.portraitKey = "innkeeper";
innkeeper.currentEmotion = "idle";
innkeeper.wanderBounds = { c0: 2, r0: 4, c1: 12, r1: 9 };
innkeeper.patrolSpeed = 1.5;
innkeeper.idleDuration = 80;
window.innkeeper = innkeeper;
