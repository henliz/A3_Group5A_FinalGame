//runawayMan.js — Jerome

const runawayManDialogueByDay = {
  1: {
    name: "Sir Jerome",
    exitMonologue: "He's too on edge… I don't want to make things worse.",
    opening:
      "What now? … I already know what you're going to ask. Everyone's asking the same thing. I was in my room. End of story.",
    repeatLine: "You again?",
    hesitationLine: "I can't deal with his attitude right now, not like this…",
    options: [
      {
        id: "A",
        cost: 2,
        playerLine:
          "I'm not accusing you of anything. I just… I need to understand what happened. I'm the one everyone's looking at.",
        npcResponse:
          "Fair enough. I was in my room. Heard the scream around two in the morning, maybe after. Came out and the innkeeper was already there.",
        npcResponse2:
          "I'd seen her earlier that evening. Helen. She seemed fine. Normal.",
        monologue:
          "He saw her that evening. He said it almost like a footnote, like he wanted it to sound small. I don't know if it is… Should I bring it up to him later on…",
        notebookEntry:
          "Was in his room, heard scream and saw Helen earlier that evening, described her as normal.",
      },
      {
        id: "B",
        cost: 1,
        playerLine: "This must be a rough situation for everyone.",
        npcResponse: "You don't say. Don't drag me into whatever you're doing.",
        monologue:
          "Whatever I'm doing. Like he already knows I'm trying to figure something out. I didn't give him anything and he still saw through it. Or maybe he says that to everyone.",
        notebookEntry: null,
      },
      {
        id: "C",
        cost: 0,
        playerLine: "Sorry…I was just passing by",
        npcResponse: "Sure you were.",
        monologue:
          "He didn't believe me. Why would he. I stopped directly in front of him and then apologized for existing near him. He's already decided I'm suspicious or irrelevant and I gave him nothing to think otherwise. I don't know which one is worse right now.",
        notebookEntry: null,
      },
    ],
  },
  2: {
    name: "Jerome",
    exitMonologue: "Maybe I should talk with other guests here.",
    opening: "They can't know I'm here… They can't know I'm here.",
    repeatLine: "Sigh… What other questions are in your head right now?",
    hesitationLine: "I can't deal with his attitude right now, not like this…",
    options: [
      {
        id: "A",
        cost: 3,
        playerLine: "You were one of the first to accuse me.",
        npcResponse:
          "What are you implying? Nothing. I was just curious to why? Oh… Sorry its because you were new and I already knew Mrs. Gustall and Krisia. Did you see Helen before she died?",
        npcResponse2:
          "Yes, Helen and I had spoken earlier that evening, in the parlour. She wanted to return something of mine. We talked for a while. Just something personal. It doesn't matter anymore. She seemed perfectly fine when I left her.",
        monologue:
          "Returned something of his… In his room. He said it like it was minor. Like it was just a thing that happened. Helen was returning something of his in the parlour late at night and now she's dead and he was already awake when it happened.",
        notebookEntry:
          "Jerome last saw her on the night of the murder… Jerome accused Little Red.",
      },
      {
        id: "B",
        cost: 2,
        playerLine: "Do you have somewhere you need to be?",
        npcResponse:
          "My father-in-law's birthday. I was just passing through for one night? And one night turned into three? Sure… Funny how that happens. Helen and I had some unfinished business. I was waiting for the right moment to sort it out.",
        monologue:
          '"Unfinished business??" He said it so quietly too. What else could he be hiding?',
        notebookEntry:
          '"Unfinished Business" with Helen. "Father in-law" Is he married?',
      },
      {
        id: "C",
        cost: 1,
        playerLine: "How have you been?",
        npcResponse:
          "Every night I been here feels longer than the last. Did you know her at all? Helen? Everyone knew Helen.",
        monologue:
          "Everybody knew Helen… He said it like it meant something specific and then shut the door on it. Maybe he is just as anxious as I am. Or maybe he just doesn't want to be the one still talking when the police arrive.",
        notebookEntry: null,
      },
      {
        id: "D",
        cost: 0,
        playerLine: "(Observe what Jerome is doing) [Exit]",
        npcResponse: "….",
        monologue: "Maybe I should talk with other guests here.",
        notebookEntry: null,
      },
    ],
  },
  3: {
    name: "Jerome",
    exitMonologue: "Maybe I should talk with other guests here…",
    opening: "What now? I already talked to you yesterday.",
    repeatLine: "Do you need something else?",
    hesitationLine: "I can't deal with his attitude right now, not like this…",
    options: [
      {
        id: "A",
        cost: 3,
        playerLine:
          "You mentioned that you met up with Helen to get something from her. What was it?",
        npcResponse:
          "I don't see how that's any of your business. I'm just trying to understand what happened that night. Helen was a nice lady, she didn't deserve this. Did you know Helen beyond her working...",
        npcResponse2:
          "at the inn? Yes… When I checked in, I was going through a difficult time. Helen listened and comforted me. I gave her a necklace to thank her for all she's done for me during my stay. But that night...",
        npcResponse3:
          "I received a call saying that I had to settle a large fine so I asked for the necklace back. She refused and said this confirmed her suspicions about me. Then she stormed off.",
        npcResponse4:
          "That was the last time I saw her. I'm not sure, but I went back to my room. I remember her necklace when I checked in. How did it end up hidden between books?",
        monologue:
          "According to Jerome's story Helen must have left the note after he went to the bar. Suspicions? Does he mean she knew about his wife? Or what the fine was for?…",
        notebookEntry:
          "Jerome was in the bar at the time of the murder. Helen stormed off. They had a close relationship (he gave her an expensive necklace). Helen knew about his gambling fine and wife.",
      },
      {
        id: "B",
        cost: 2,
        playerLine: "Good morning, how many nights have you stayed so far?",
        npcResponse:
          "Six. I wanted to check out and leave, but now I'm stuck here. Yeah, but it's not awful all the time. I've been playing poker with Mrs. Gustall in the evenings. No money though,",
        npcResponse2:
          "I'm not getting involved with that again. Anyway, I hope this wraps up soon. I have business to attend to. Yes, my in-laws will be so angry if I miss it. Hopefully this is over soon.",
        monologue:
          "So he IS married. Why else would his in-laws care so much about his attendance? Is his wife the woman in the photo I found?",
        notebookEntry: "Married. Has a history of gambling.",
      },
      {
        id: "C",
        cost: 1,
        playerLine: "Good morning.",
        npcResponse: "Good morning, is there something you need?",
        monologue: "He seems annoyed, maybe I should talk to someone else…",
        notebookEntry: null,
      },
      {
        id: "D",
        cost: 0,
        playerLine: "Sorry…I was just passing by [Exit]",
        npcResponse: "Sure you were.",
        monologue: "Maybe I should talk with other guests here…",
        notebookEntry: null,
      },
    ],
  },
};

const runawayMan = new NPC(700, 500, runawayManDialogueByDay[1]);
runawayMan.dialogueByDay = runawayManDialogueByDay;
runawayMan.journalPageIndex = 3;
runawayMan.portraitKey = "runawayMan";
runawayMan.currentEmotion = "idle";
runawayMan.wanderBounds = { c0: 2, r0: 0, c1: 12, r1: 7 };
runawayMan.patrolSpeed = 2.0;
runawayMan.idleDuration = 50;
runawayMan.spriteRowMap = { 0: 1, 1: 2, 2: 3, 3: 0 };
window.runawayMan = runawayMan;
//"Have you been snooping around my office?! It was bad enough Helen was always rustling around, and now you're rummaging through my business. Anyway. Don't ask me; my sister runs it in Oakdaleasdfghjjhgfds.",
