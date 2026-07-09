export type LocaleContent = Record<string, unknown>;

export interface HowStep {
  title: string;
  desc: string;
}

export const SUPPORTED_LOCALES = ["hy", "ru", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

// Default landing content per locale. This is the seed for the DB and the
// fallback used when a key has not been overridden in the CRM.
export const DEFAULT_CONTENT: Record<SupportedLocale, LocaleContent> = {
  hy: {
    htmlLang: "hy",
    locale: "hy-AM",
    "meta.title": "Eventhub | Ստացիր քո պրոմո կոդը",
    "nav.buy": "Անցնել Eventhub",
    "nav.events": "Միջոցառումներ",
    "nav.how": "Ինչպես",
    "hero.badge": "Ընկերոջ նվեր",
    "hero.title": "Ստացիր քո անհատական պրոմո կոդը",
    "hero.subtitle":
      "Քո ընկերը հրավիրել է քեզ Eventhub։ Գրիր էլ. հասցեդ ու ստացիր զեղչի պրոմո կոդ քո հաջորդ տոմսի համար։",
    "hero.emailPlaceholder": "Էլ. հասցե",
    "hero.cta": "Ստանալ պրոմո կոդը",
    "hero.sending": "Ուղարկվում է...",
    "hero.note": "Կոդն ուղարկվում է նաև քո էլ. հասցեին։",
    "hero.refMissing":
      "Հրավերի հղումն անվավեր է։ Խնդրում ենք օգտվել ընկերոջդ ուղարկած հղումից։",
    "result.title": "Քո պրոմո կոդը պատրաստ է",
    "result.hint": "Օգտագործիր այս կոդը Eventhub-ում գնման ժամանակ։",
    "result.copy": "Պատճենել",
    "result.copied": "Պատճենվեց!",
    "result.goto": "Անցնել Eventhub",
    "result.label": "Քո պրոմո կոդը՝",
    "result.browse": "Դիտել միջոցառումները",
    "how.title": "Ինչպես է աշխատում",
    "how.steps": [
      {
        title: "Բացիր հղումը",
        desc: "Անցիր ընկերոջդ ուղարկած հրավերի հղումով։"
      },
      {
        title: "Գրիր էլ. հասցեդ",
        desc: "Մուտքագրիր էլ. հասցեդ և ստացիր անհատական պրոմո կոդ։"
      },
      {
        title: "Օգտագործիր կոդը",
        desc: "Կիրառիր կոդը Eventhub-ում և վայելիր զեղչը։"
      }
    ],
    "events.title": "Ընթացիկ միջոցառումներ",
    "events.subtitle": "Ընտրիր միջոցառում և օգտագործիր քո պրոմո կոդը։",
    "events.loading": "Բեռնվում է...",
    "events.empty": "Այս պահին հասանելի միջոցառումներ չկան։",
    "events.buy": "Տոմսեր",
    "footer.tagline": "Համերգներ, միջոցառումներ և տոմսեր Հայաստանում։",
    "footer.disclaimer1":
      "Զեղչը կիրառվում է պրոմո կոդի միջոցով վճարման պահին։ Օգտատերերը կարող են վաստակել AMP-եր՝ վճարելով MyAmeria հավելվածով կամ Ameriabank քարտով։",
    "footer.disclaimer2":
      "Eventhub-ը պատկանում է Dinno ՓԲԸ-ին, որը լիովին պատասխանատու է ծառայությունների մատուցման և որակի համար։",
    "footer.follow": "Հետևիր Eventhub-ին",
    "footer.discover": "Իմացիր ավելին",
    "footer.terms": "Պայմաններ և դրույթներ",
    "footer.rights": "Բոլոր իրավունքները պաշտպանված են։",
    "error.generic": "Ինչ-որ բան այն չէ։ Փորձիր նորից։",
    "error.email": "Խնդրում ենք մուտքագրել վավեր էլ. հասցե։"
  },
  ru: {
    htmlLang: "ru",
    locale: "ru-RU",
    "meta.title": "Eventhub | Получи свой промокод",
    "nav.buy": "Перейти на Eventhub",
    "nav.events": "События",
    "nav.how": "Как это работает",
    "hero.badge": "Подарок от друга",
    "hero.title": "Получи свой персональный промокод",
    "hero.subtitle":
      "Твой друг пригласил тебя на Eventhub. Введи email и получи промокод со скидкой на следующий билет.",
    "hero.emailPlaceholder": "Email",
    "hero.cta": "Получить промокод",
    "hero.sending": "Отправка...",
    "hero.note": "Код также будет отправлен на твой email.",
    "hero.refMissing":
      "Ссылка приглашения недействительна. Пожалуйста, используйте ссылку от друга.",
    "result.title": "Твой промокод готов",
    "result.hint": "Используй этот код при покупке на Eventhub.",
    "result.copy": "Копировать",
    "result.copied": "Скопировано!",
    "result.goto": "Перейти на Eventhub",
    "result.label": "Твой промокод:",
    "result.browse": "Смотреть события",
    "how.title": "Как это работает",
    "how.steps": [
      {
        title: "Открой ссылку",
        desc: "Перейди по ссылке-приглашению от друга."
      },
      {
        title: "Введи email",
        desc: "Укажи свой email и получи персональный промокод."
      },
      {
        title: "Используй код",
        desc: "Примени код на Eventhub и наслаждайся скидкой."
      }
    ],
    "events.title": "Актуальные события",
    "events.subtitle": "Выбери событие и используй свой промокод.",
    "events.loading": "Загрузка...",
    "events.empty": "Сейчас нет доступных событий.",
    "events.buy": "Билеты",
    "footer.tagline": "Концерты, события и билеты в Армении.",
    "footer.disclaimer1":
      "Скидка применяется через промокод при оформлении заказа. Пользователи могут получать AMP при оплате через приложение MyAmeria или картой Ameriabank.",
    "footer.disclaimer2":
      "Eventhub — платформа, принадлежащая Dinno CJSC, которая несёт полную ответственность за предоставление и качество услуг.",
    "footer.follow": "Подписывайся на Eventhub",
    "footer.discover": "Узнать больше",
    "footer.terms": "Условия использования",
    "footer.rights": "Все права защищены.",
    "error.generic": "Что-то пошло не так. Попробуй ещё раз.",
    "error.email": "Пожалуйста, введи корректный email."
  },
  en: {
    htmlLang: "en",
    locale: "en-US",
    "meta.title": "Eventhub | Get your promo code",
    "nav.buy": "Go to Eventhub",
    "nav.events": "Events",
    "nav.how": "How It Works",
    "hero.badge": "A gift from a friend",
    "hero.title": "Get your personal promo code",
    "hero.subtitle":
      "A friend invited you to Eventhub. Enter your email and get a discount promo code for your next ticket.",
    "hero.emailPlaceholder": "Email address",
    "hero.cta": "Get promo code",
    "hero.sending": "Sending...",
    "hero.note": "The code will also be sent to your email.",
    "hero.refMissing":
      "The invitation link is invalid. Please use the link your friend sent you.",
    "result.title": "Your promo code is ready",
    "result.hint": "Use this code when buying on Eventhub.",
    "result.copy": "Copy",
    "result.copied": "Copied!",
    "result.goto": "Go to Eventhub",
    "result.label": "Your promo code:",
    "result.browse": "Browse events",
    "how.title": "How it works",
    "how.steps": [
      {
        title: "Open the link",
        desc: "Follow the invitation link your friend sent you."
      },
      {
        title: "Enter your email",
        desc: "Provide your email and get a personal promo code."
      },
      {
        title: "Use the code",
        desc: "Apply the code on Eventhub and enjoy your discount."
      }
    ],
    "events.title": "Current events",
    "events.subtitle": "Pick an event and use your promo code.",
    "events.loading": "Loading...",
    "events.empty": "There are no available events right now.",
    "events.buy": "Tickets",
    "footer.tagline": "Concerts, events and tickets in Armenia.",
    "footer.disclaimer1":
      "The discount is applied via the promo code at checkout. Users can earn AMPs when paying through the MyAmeria app or with an Ameriabank card.",
    "footer.disclaimer2":
      "Eventhub is a platform owned by Dinno CJSC, which is solely responsible for the provision and quality of the services offered.",
    "footer.follow": "Follow Eventhub",
    "footer.discover": "Discover More",
    "footer.terms": "Terms and conditions",
    "footer.rights": "All rights reserved.",
    "error.generic": "Something went wrong. Please try again.",
    "error.email": "Please enter a valid email address."
  }
};

export function isSupportedLocale(value: string): value is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
