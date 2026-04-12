//doctor.js

const doctorDialogueByDay = {
  1: {
    name: "Doctor Krisia",
    exitMonologue: "She looks like she needs space… I shouldn't push it.",
    opening:
      "I keep thinking I should be doing something useful. That's the instinct, isn't it? Something happens and you want to fix it. There's nothing to fix around here.",
    repeatLine: "Hello Again.",
    hesitationLine: "I'm too drained to approach her right now…",
    options: [
      {
        id: "A",
        cost: 2,
        playerLine:
          "You spoke up first this morning, when you said how could this happen. Did you know her at all?",
        npcResponse:
          "Not really. She brought me extra blankets the first night. Kept asking questions about my work. She seemed… curious. About everyone, I think, not just me.",
        monologue:
          "Curious about everyone. That could mean nothing. Or it could mean she knew things about all of them.",
        notebookEntry:
          "Helen was curious about Dr. Krisia… Seems like she makes an effort to get to know the guests.",
      },
      {
        id: "B",
        cost: 1,
        playerLine: "Did you sleep at all?",
        npcResponse:
          "Barely. I tried to, but you can't really shake the feeling after the scream. You're the one who just arrived, aren't you? That must feel awful. Being new to all of this.",
        monologue:
          "She turned it back to me. I don't know if that's kindness or deflection. I said yes and didn't follow up and now I'm not sure which one it was.",
        notebookEntry: null,
      },
      {
        id: "C",
        cost: 0,
        playerLine: "..Hi [Exit]",
        npcResponse: "Hi",
        monologue:
          "That was so awkward. I got lost in thought trying to say something to her and now I'm at the other side of the room. Maybe I should try talking with someone else…",
        notebookEntry: null,
      },
    ],
  },
  2: {
    name: "Doctor Krisia",
    exitMonologue:
      "She looks exhausted. I shouldn't push her any further right now.",
    opening: "You can sit. I don't bite.",
    repeatLine: "Hello again. You seem like you have more questions.",
    hesitationLine: "I'm too drained to approach her right now…",
    options: [
      {
        id: "A",
        cost: 3,
        helenEntry: {
          section: "doctor",
          text: "Seemed suspicious of Dr. Krisia",
        },
        playerLine:
          "Yesterday you mentioned Helen asked you a lot of personal questions. What kind of questions exactly?",
        exchange: [
          {
            speaker: "npc",
            emotion: "idle",
            text: "About my work. My hours. Whether I kept certain things in my room.",
          },
          {
            speaker: "npc",
            emotion: "idle",
            text: "She asked specifically about wolfsbane.",
          },
          {
            speaker: "player",
            emotion: "determined",
            text: "Wolfsbane?",
          },
          {
            speaker: "npc",
            emotion: "sus",
            text: "She said she'd read it had medicinal uses. I told her my medical practice was my own business.",
          },
          {
            speaker: "npc",
            emotion: "sus",
            text: "She smiled and said of course. But she kept prying.",
          },
        ],
        monologue: "I hope I didn’t sound like I’m prying on her…",
        notebookEntry:
          "Helen asked her specifically about wolfsbane and about what she kept in her room. Krisia tried to shut it down. Helen didn't stop.",
      },

      {
        id: "B",
        cost: 2,
        playerLine: "Do you think anyone here could have done it?",
        exchange: [
          {
            speaker: "npc",
            emotion: "sus",
            text: "I think people are capable of a lot when they feel cornered.",
          },
          {
            speaker: "npc",
            emotion: "sus",
            text: "Some people just want to be left alone. To do their work and move through without being...examined.",
          },
          {
            speaker: "player",
            italic: true,
            emotion: "determined",
            text: "(Examined. That's a specific word. She said it like it had already happened to her.)",
          },
          {
            speaker: "npc",
            emotion: "sus",
            text: "I felt like Helen was very thorough.",
          },
        ],
        monologue:
          "She didn’t say no. There must be more to her to the words she uses.",
        notebookEntry:
          "People do things when cornered. Used the word examined unprompted",
      },

      {
        id: "C",
        cost: 1,
        playerLine: "Sorry to bother you again.",
        exchange: [
          {
            speaker: "npc",
            emotion: "idle",
            text: "It's fine. Are you holding up okay?",
          },
          {
            speaker: "player",
            italic: true,
            emotion: "idle",
            text: "(Good thank you...)",
          },
          {
            speaker: "npc",
            emotion: "idle",
            text: "Sigh.... Night seem more peaceful than the day.",
          },
        ],
        monologue:
          "She turned it back to me and I just said good thank you like a reflex. I hope I didn't sound like I was prying. I had something real to ask and I lost it.",
        notebookEntry: null,
      },

      {
        id: "D",
        cost: 0,
        playerLine: "(Make brief eye contact) [Exit]",
        npcResponse: "…",
        monologue:
          "She told me yesterday she's going to Greenville. Same place as grandma. Same place I'm trying to get to. I stood near her table and couldn't figure out how to start a sentence so now I'm looking out a window like that was always the plan. I know what I'm doing. I just can't seem to stop doing it.",
        notebookEntry: null,
      },
    ],
  },

  3: {
    name: "Doctor Krisia",
    exitMonologue:
      "She seems really tired. I should wait until later to talk to her….",
    opening:
      "Sorry to bother you again, I'm still trying to process what happened.",
    repeatLine: "Hello again, do you have more questions?",
    hesitationLine: "I'm too drained to approach her right now…",
    options: [
      {
        id: "A",
        cost: 3,
        playerLine: "Can you remind me again where you were two nights ago?",
        exchange: [
          {
            speaker: "npc",
            emotion: "idle",
            text: "I really don’t want to think about that night. I keep trying to get the picture of Helen’s body out of my head.",
          },
          {
            speaker: "player",
            text: "Where were you when you found out?",
          },
          {
            speaker: "npc",
            emotion: "idle",
            text: "I went on a quick after-dinner stroll around the grounds and said goodnight to Mrs. Gustall around 11pm.",
          },
          {
            speaker: "npc",
            emotion: "idle",
            text: "I had just finished washing up when I heard the scream.",
          },
          {
            speaker: "player",
            italic: true,
            text: "(It’s a bit strange she was going on a walk so late, but after dinner walks are pretty common...)",
          },
          {
            speaker: "player",
            text: "I saw you leave the inn yesterday evening, were you going on a walk?",
          },
          {
            speaker: "npc",
            emotion: "idle",
            text: "Yes, I find evening walks more peaceful, the crickets calm my mind and I especially need to due to recent events.",
          },
          {
            speaker: "player",
            emotion: "determined",
            text: "It was pretty dark outside, you’re not worried for your safety?",
          },
          {
            speaker: "sus",
            text: "The moon is still pretty full so it’s not too dark. Besides I’m perfectly capable of defending myself.",
          },
          {
            speaker: "player",
            text: "Thank you for sharing.",
          },
        ],
        monologue:
          "What does she mean “she’s capable of defending herself”?  Is she capable of slashing Helen’s throat? I should watch my back.",
        notebookEntry:
          "Krisia was on a walk the night of the murder and typically goes on evening walks\nNot worried about going out late at night\nKnows self-defence",
      },

      {
        id: "B",
        cost: 2,
        playerLine: "Do you remember anything from that night?",
        exchange: [
          {
            speaker: "npc",
            emotion: "idle",
            text: "I tried to forget. I've been studying to keep my mind off it.",
          },
          {
            speaker: "npc",
            emotion: "idle",
            text: "It was such a lovely night too, all to be ruined by such as awful event.",
          },
          {
            speaker: "player",
            text: "I understand. The picture of her laying on the floor won't leave my mind.",
          },
          {
            speaker: "npc",
            emotion: "idle",
            text: "Helen, didn't deserve to die in that way.",
          },
          {
            speaker: "player",
            emotion: "idle",
            text: "She seemed to really care about everyone. She didn't deserve to die.",
          },
          {
            speaker: "npc",
            text: "Oh she was very sweet and accommodating, but she was really unprofessional.",
          },
          {
            speaker: "player",
            emotion: "idle",
            text: "Like how she would ask you specific questions about your medical practice?",
          },
          {
            speaker: "npc",
            emotion: "angry",
            text: "Not just that! She would go through my medical journals and books.",
          },
          {
            speaker: "npc",
            emotion: "angry",
            text: "Once I caught her following me when I was going on a walk, it was so creepy!",
            helenEntry: {
              section: "doctor",
              text: "What did Helen know about her?",
            },
          },
          {
            speaker: "player",
            emotion: "determined",
            text: "Hmm... Interesting",
          },
        ],
        monologue:
          "That is odd. Helen is nosy but why would she go as far to stalk Dr. Krisia? Could this be related to the ripped page she wrote?",
        notebookEntry:
          "Helen would look through Dr. Krisia's medical books and even followed her outside once\nWhat did Helen know?",
      },
      {
        id: "C",
        cost: 1,
        playerLine: "How did you sleep?",
        npcResponse: "Poorly. The events of that night still haunt me.",
        monologue:
          "She seems really tired. I should wait until later to talk to her….",
        notebookEntry: null,
      },
      {
        id: "D",
        cost: 0,
        playerLine: "Nevermind, I'll go talk to someone else [Exit]",
        npcResponse: "…",
        monologue: "Maybe someone else will have more to say.",
        notebookEntry: null,
      },
    ],
  },
};

const doctor = new NPC(600, 450, doctorDialogueByDay[1]);
doctor.dialogueByDay = doctorDialogueByDay;
doctor.journalPageIndex = 2;
doctor.portraitKey = "doctor";
doctor.currentEmotion = "idle";
doctor.wanderBounds = { c0: 2, r0: 8, c1: 12, r1: 14 };
doctor.patrolSpeed = 0.9;
doctor.idleDuration = 200;
window.doctor = doctor;
