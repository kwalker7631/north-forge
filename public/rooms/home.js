// rooms/home.js — The farm landing page. Soul of North Forge.
// Wren's cutouts, real weather sky, stars, North peek, full vibrancy.

import { ROOMS }        from '../data.js';
import { NORTH_VERSION } from '../north.js';

// ── CHARACTER CUTOUTS (Wren's artwork) ───────────────────────────────────────
const LUNA_IMG    = "data:image/webp;base64,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";
const ELEANOR_IMG = "data:image/webp;base64,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";
const SALEM_IMG   = "data:image/webp;base64,UklGRoQXAABXRUJQVlA4IHgXAACwZQCdASrIAAkBPpE8mkoloyIhqFEs+LASCWUA09EFzblvPDJOT60cT9L71jzeecB6fd663p/INPTn+s7dP8d9tvkZ+rfyn5k82GJ98q+9n6j1tf1vfT8ytQX8Z/mH+v35kBP1T/5Hp+fE+Zf2C9gD9Zv+j5ZHhJemewR/O/7J6D3/p/sfQr9Pf+//U/Ad+wX7B+2Z7Ev3h9oD91kUJp8hYUJFLFui6BAK/BWGP7RzX9ivzXJAF1RPhc0DRjzPbV3jAZ+ZrD6Cutd/aMkKAzeFBB2mMbPlVvFE1mopok5kp8R8+9Tli3z4InA1bWqvBYJSu0syD2R0GCTj9bkBfJ+Ywg7ku38Y70E/nOutcWGxmv9IMzvSV/MUty9FLjeYdqVc9TeuWl5yMabJ91LmKpK4kQ6V4X39SOK5vQgo0zQMxzsvLYGmhyZv5eIG/71+CCcOkCu8DzPlyIrNpO449XrTpkN97Gr67k+/EaBaMpeAWL3JkLWGWEYqRpy9WYmssSxuXrtGNIX7JtGdVNQpr4MALrg1oU1wjNHmbLvb2XYCPRSfHKImiCSSor0yaEWL9AL2LRKgltM39de/DYYdXutV7WR0Z3G6mVnDw/vTinUI93diadkxd9EUK9wuCzjCzF2SYpw5xxCBhrJl+VPh1TTmZU5TPr6mEE6uvX6upu2ufm79/u1Bzc8sAosE6y2V4nZG/8WfZDA0n+OrG5sFt1hB0whMH8O1HlxJVW0iSEDwJL0bhRzVxfKGmyWH6x+pwFXN8Qfo1VmEQ++jfANV+EOB+tuEJesc09WM5UxFgTezl+No4fT3vAV6moBz1yhVOonB6h0DTA6RMRcCP54TGkIy98NLo1qFDuRq8w8LBYWH5RDv/Zdhtfao2uBttxgBYa5rcaTjOTH9nMfxD6EiaxxCptF4oW0XUIAzLFxqtlfNLY7Y6je3sEfwDhw0b1zBtOpcK6WHMWEaVTQDtXik5wpKvsVBVnYW9cPynol9IiRsZ6VJDLV83a8t438X2FwBxxukdXYA8o3E29STiADBB+eh6Jl+Q7ksTb1owQFp31WTbB2/zHv52xK71aJo/vNrLhXzSmesvwAA/vtvg6x0iYMpN4ZnjrXJU/xkZX76qobO7YpjEOTvZ7xPTP/H6Vka2ulF2TDCrvtQcjoUuNhRm8QdwXqn9yTtoTur//Agxi08/CFhUywcqA76KaEYNudsU2OxDMD6HOKFl41/nvdqdlD0mBTNWNP76l7HijhdjyM9cOzvSskdjAMEcXOEa10yZkTZYvbzfkSh1vC6oxAWQa5gKBOvGroyABRHAuD+knjgdXliiiTRF/GBlGcdPQHiL46ulNoQOFFe0SX1wcHKl6GSJ7zhnctZGqXBhnksW0Mdpterw77q2oi6LCYteaB7wAP/N7Od7dv0Gu5S95U8Gy9qIVJNICwgrXiG7AOSI+jc4vHQXadKFsvN5XNslpGdh+wrtjF6sGVaqcdx0zebORBt302WQIpeKXr7CFnhMw3+UCYVIUQFeZf5ijQ+vxHJyyc4dtr8DvEICyHqmQxM6u5uie/eKoUv+wZx6DjdOjilXBi+S+nysIitg/B7nQufNDrwL8sZVYhvec1VD3SuY+xcJ3U849+Ki2RWfXgilHbpeBgOY+j05qMSydFAiK0+IYYsImgjqJ+aZWzekDVsVYJQAOxqCFJew7FOuBc6wriSyQsePLyFQJW4R01fwZgu73vHvH+dSzVBDoctHuA9qridaV2T7/OrosKl9RJ5ewpUaXW4PQaQT3kk6+2SWaxzj/DrdtQI5WOGZBFbtDHwXXhUBFLaZNm1PSRbYD7mkusgEp9EYEeGG7h8AwBQJsIDYv9+CUAxfi9/KSzHQUrE75T6rnFz65DHnIp9aScGlkYg6GwYv+WSJ/OTfe4aNGSRNXP108LstJOiFtNzetM0jxjay6PbyOl6rM0M6m55uTx9FuRzVnP2c3pgpYofcB0/Z6EjwBU6dAlaqN4PhnZ0hST4ucnR/M/3ikDrWAKT6cNfOsZDu2TuZ9thxKeb1eTFx9LUrrb1aND6RMIEmD664q4AqBgfZ5n58dG1dEbdPrsgejvzn/eQO53Ue7d22IDjtRlKL0nn2Ml1QNT+a2N/uOD4P8i6vsF/EfRWavZG0Bm8Tyj0EwrBpUv3ho6LcH/RcU/yve10Lr0k5Sf1l/jfYTVcqcdqIkHwjIcwvAfEpO+BRRxPW9tVEoVz+VJrrOA8My8UxQxR/xaczP2i3ic0UMH9DwvNO1ShJP71EwHLYI97ZJ0dMj7AYl77lRmQbqKoLMNvONOcYPnYAROoHr85PNuUQyhccBQUhTZXW942TuNZa2Wk3Ubw5+FV/MwbVcC0rwbUEWnBivYZZO1Xs0J2RTa/Ks4nFwHNrOq8GrYJyEak9LjQ0X66w9EZzdT464g/LXnvMuT8cTbGvJ/OS3WeXZeJbih7TeliDumtSUBjzteQg1R0HI0hCxMGJInTWMIOaBTtGNeCpY00dAnlJ30lALNJMpU9SEe71MLilPbiYPwChVq0HPULhxrEFzYmJjSqV9jYdZPy8jQAXoikMqWuWuMaDgShH9dLy2GYj1xe0yONXLDp+icEhTtzqat5YuuM7LEGDLMPg+mfPjyxHeSv85hz3VRgldWbBUfYzFCaxHg3mWoN1PwzqE3xm+xnU1IRVDraphPN85x58BYnwY0zXmlNdduOmM6syZcBcyZYFe7hqaZkYedY8ubflFFxF7Pj5i6fdT1VZcxKJvzDKOkV9a4+ciCFbMwWSo/ry73t0tcQ9f/e2nvg7k1qh7CLaa0S7Y4qwDO5wpw4cS+k4wjq1fCiJWp9mapDbJlwNpI9IIo6O8ov1xdaBMx+t6MIcOmfc0AId67uQl6wFXdhyUKqV2UWx/+eoVqsSpLBhtdHjlvivpYsb/y+RNgmG3iq13qKcL0N2KVYJQVhGsHbklgQjwLp8JMIDEPXQe+WDNSdbkfiqWAEWbCsqqybT0Q7ChOn0N4BATBJzNikkPy5S3flhS6D+f/o9abb/RMX2iz0Mz7AyWb/irTtpyk0jUxx1j2zvDNquIS/s/AAhLtLATes4SwtLui9NWTTkKaNQPtGTAloTycstJQHKCEEQR+9sHzDFJd06V5fUNNrLxOo+USDeTF+atHn8cLQrBBIC67jgaE5yM9fy7hPgbPIrdJoqZkumdXStSkEqptF+DqMQilWWeANtpURK5wzjcmIgjeZfwNN0MNQFNhDPQDICJSrXXMJBB+B9m8ZCF4u/aEATakHzRDPl1NM4H1l/2VOgyt2EWeML0aZrW98m3C0lK1iiDiHT/+rJdLXYhXk7hsJO4X1hWeRYRI9ZLpZtz9QxFfFqyy6mOrNpvI+xB7NeT6UzBAflYHruv+R8/LCwhHjH6Opg/BEUgGz6dj99WD2hl//LdIhPXRe5GmLU+qfEqIk0aEvaIwLVe1cq/nh88uwxpUQSMRQT931twIl8yXYsPc/sf3PGETNqcZx1pGsQE/ik0iZTKtD6vCiipisxAmuTjQuyQDSYJ75pjdRl7dWnsaN/4n/7NtzsQxjjzLrVieotEaJJ2Iea5iNUjpYIu48HKsDe/FUnzk/i2F4SfFp7N5DGk01Sm2q+Qtwg+1WjmBve+fei6ZM8G9wf9abnkfvkB+QKKTXFIJahnbCBOuDe/NqT3t2NxUrfSg45CbUGkdFoELOwBCw+ZjE1gyfI9UMeky+cPKeOt1XAD8HDNDtCfwoHLUd4lJp0AFX4ulpg81UPj1+Q84N+2YGTbCLe1IiSymaFS03k3rlTyYHqvZKDyTTfUMTuy26LBQDg30TUFvjrK22uyjnmPwgqhlR8/4WsEkF08eXgvIxmS24xS8pUWzUzGXipfgam3bnMLt67HtJylmiyn5SUEzorVdc/4e2BijakyQNoLoKum6lbe+uAFlfMFSQRw9BEdx77GekbqThbA/8buOKtWqs3rhbiI+XIDwdHbQ3aTzC0ER5yp9UQDSbseRvbkKbpj27LeYxtz1ZrTaMN423HaqlCoxMiUtk+La07Ro2Hv45zFDoqB1ez4ls3RvXZNI67YhaD8qikR3Jps5WeDwts5zDMNzVY5i07kl05TfFptqsr2myIf0yPYmpsBKp7JC+YYY7I0VgqVZfZIEikjzBzaed7lwTS3Xb59rPfYU/ztxwgXJFDT5qvNGUraC/olnOlkX6lz06rCJ5RBhBc7h5blfiuJ6ICqqW6oMB8h8ZOOfk1MP3WBaWDzaXJoE0tYdz+MEhAvd1S2ITDIub4WlxRNePRloamDS/NYknIw0EV+UxEDoJQDCpNSVeBIJDSVXOW75kCVzQeEmLVyWQp8KRVv/LaZwHLO0zIGRA+DKi9RDFsNS6s6b8Yp1i5wv7fQvrnJWu9PcASawZfAk/todh2tmfTUHNMLjMGizOcZmMXn0BhyLAnXMCYH1c2TQCh0d1hekLK360s+7hkW7dagCauww3j8VG4daXxCka2WraSZ9nR4Hlvf9jqpiL3dVqR0FDe9PXCq0mS7QKEYdQP08Ue54jrLuyUXKlGRt1xtcWD50Ahi4vzvsBDvVANXs7HJ7aJd3tIby0LiCiCrSjSlkpPaZvJI29l+FlyZXJpPHj2fYxUZK3bnYTtyZ4JT/ldvWbDoFkdknr6FDxvB4jMHWeTRrMfcw3yDEnZWXYUgcGDqx6gBdO7It5XG2jTSnCrgAjCmkyaY/r851PlZ474lb8VbBUsKw4gJu55yoLDnMBFny18pspR79tg6Fq5bbWXxDg7vumkhHrjAO9/6LTCdztsHATJpJ4lfw9JSVUgOb6BZvBbgnZj5VSYPJenc02L+PYxvsXyyl6nuvv4lQyLv34lLZ9IiAZKPcAJFpLP2j84pPbB4sAY6wviCF8Sbx4ELdC+FVW2eXbw9I/rEpQYzE53H0eM0LfmaCYdbowrUPMY7f1iPi2s4rY05RszrVljAbpfqJvw4odSw5rsu2dWHvzTXLCbphr03ICxDeN8dS+93/qXaM1Q+N8IA5tSk6EiPHsBDkVOQrccavbO67Qa7SOGyS4CrryxOM4tMDoeS27Gdvy0DViKXWDuYWhL9IwcSnZNWF+4PgZsZxL0zQNnD3ChuFq7NA0VnHnpH85Xt7kXeUSmWpKwt/PdJK1WHcOyaf8+y9O0fmwvZx0qOLkAEc5Vavz5wwC9pW0/ofW/5cHjyz1BQcSWeA0brkq6YLaFgvfEz1EvZRJnVudvjib+CoeeuOKp1Mho1E0hsAlWkUQU0dqjcMpyrliB1jR2xyRJ1NJhxJxLkQY1EyyGJHgj/uk+dtKzh9V7JrCMFzlicMBP5pDtux7fv+PqekNBD2SFBJfbqJOuijhR+hYQhXcPWIOs7XY7ShbWvmdFt+qxnlwjmbUH0WJeP3V20x76sy3tZVK/ci2Gfmjv/tgG4CJ/Gx6tyuxJQwlZjf/6S0uJRQp3L8013HNUxvVKHtsEbGbYZwEFR/e46zO26Wfbs7/EQNuHX+R8qRlqidaadXoPWmOPVmCBQzq1TTbeRg9vpS1VgI6uQ8VrlsWsCVrRgtwFEIo7weNy/OMrhNvq8gRHM/vF3GNW7sOygdWxAkmJv0EohkhsnZXWrh0JOancWTg5JeNa4qKFJX1FHigFBOlYE/8jIhnkjKuDhzYxbIXkbnGGPMRem1XvbILYe2IpeSG0yXDkFcAWHc4fxizeNpkZOUr98nBbYrd0N2X3TxEl1jcalZZkPT2ivEBMELaTgvsRUK2SZkopl26Via5aNAfKw3/BiAn30d2IQ2qHVPmryrpZ5c8JcbKNg+goMdXTnsTjVHQYD63ukGwV7SYUkeGdh+iL1ZVw9dLv8c3BbDsK0yZtGzs4idyk1yauKvXZS0pD3mlGKkWMhp9c9C7uhXb2hO0Vfw7VX2idOz0HCnfqk7sIqMTHGUSpQBKLFI+QPG2NnvYiM7//ZhD6JT98qN7vkDQO9wGLXBDB+BneeuLxgNjBzrE7014nnyud/UEyAyPXIHRCRHes3HuVS9/6BJbe/au84DWH9hoTw6wrpxSPAiN99g0yGKRkNtSG7e3RhEmcZ+YqcKbOcKPfxpo1qyV7fqiSzv+20pi02sBX3bEcD0x1dMYAzPbiRGPkXNCwkQFclwV7AoezCPTjJ45VLjWIHjn1OfO8/uHn6AI0/bEn/r/XptaMGIwgXT3L3lfy/cyx1irR8ancnpUa48Z6oAxb7W5uQ6k/Jo8bDVPm0DPhM/WC12627xlgRqH73U52c6dDMRv8nHB+XHAjr+ZdRGXacP391z4enriMnLzlFM5rg81xwT0dvt41xSPXWKEI+hCMW5q/OZeKtwPn6aIoKydSKMch3Txy4Y9c4nveHOm1vtvYaVEmOA8VDgsxfvOe5eH/G0oviTStZ1MKGExhuAxPUMv0UMFhJIuqvyElyVXCpOJLBrZbWZfTs68qZsaDNv122sqfEAL915PdmCf0TOrRiqqzDDV+0hfw1OT7rmbxebUjr543iwnvZX1/HyTgo1OyrK81iKe1EG43G9rtcs7f2/Hn3fLFyzJq6doy2TAn1vFQsEzluWh031jKz0f/usYPurREtL29Dd/z4d5ecMsAdsxs64KKVrpQoZLTNf/gwEinVjEIBKmZ8xkc+o72ck/+L1BJHEJ1xtBuRp02Jrs1v9LVv85yXXVx5/InXzT3xskxOBGZzXFKWLr6JZyNszrmN9bZ5n4SO0kaSxuPV9oaSejokmwsXQ5VhJKuzCIJWB3hiS2cLpz9mjYYy3R2fCyDVZdxJwNCkX4KbpNBEkvP5QuKc+RHAbP+SHVd9UdmpVeBy2YA4ZSsNqtLHQRv5K9cBA4ecicRq+FJ44fhqEF1gJKMkTItTlQfB8fZP3/SbMkCg4EbShDJYjD3UJ0fkwVS4dQXkskqd69y7m61sQXE3bImae4zO+ZFnWzC1lwL36MXhgqg9xJ0gmAPle6ldhlaXfJiEjksuejMXkc2GiOP5xcXD8SGAr9Bw9iSNEVN9iOOg9O/z5oe9cyleF2+qu+fB52ABOoP0/qqb8o5WVLTuguZZemvRlD/jt3LFkC1Yj0jJsXLOjL/xOvkAsBJMwBiz48FotakimRWPUvkjiVyPGbLm/DnlzZ7/ePxDNallMx+vVRiNAS6hP7Elkt0VuWUAOz9x7538L0BO+xPk7/7cLlkSvh27wj7/XEQmKec5D7TBCkULlPsGhyrH0MffNQQ74BM3Z0p6q58hWK1+HX9Pq+v6NJjNZTkN9CMKO0bEElqVfM8x9uTIN70ii6trLEV10owU52bH/FrEP0tiI7C9jhdUYJ1hZQL+JcXFAKyVC8OcxdzZV58HZp8TwTQzvTOszgrLai5V3BC0tZ4jOt5Tqo41eSFr1cpChPTVLtWalwuVSGwkndaBzQvojbpZ/U6M2udjtC/XIivFnhw+WtFm4y1EbkRnhLdqTNjxbCr+Yz+tLJUFuyc9xpk//vJQA1Z/6KYMBUOOXegQZ2+xODebGEYizN1edtKYPc9Sm/0CUxSEVJIgW+nquON45iAfrgx7cVf3seLFxurRFmcwD+sjXPI3brcIuBTihLSH/j0PjYwzUHvx/92r5txR8LCGfkDDAJRBLGu3t4QixPEZrusJ+sRIcpwBPybY05l9eRCfk27hqFFo+VxQV9UOrToAB92s83GTsjP88+2NyoGSHu+HpHG9xOUKh4U2q/uMAdeK9oK32qdHPQzssf5YbAtYTQTrHy0b5CJW0Din59LeK1HjQQ8zh3PIRE0/K4xR+ViUAP+kLYzfiCtWMyJb+M4Mmr14LAd66lnJnMGu1Z5jGdwo6VAuNu+we88ntKtbIvXd6yZ3247oZgKz5D4eDeLMMdifwzod/shJMDtghLMj+vfwxHQ6efyqrZ2ALBoNzRyEG12hdmgLUzMEqJkztgOGlV8KE8CoP8o/E9oxKdPMvWoC7MWJypyFAj8mDhPP6QY+ivEspMsbffLvUx/D0NOBbCbAuIgVYAWGRAAA==";

// ── NORTH PEEK MESSAGES ──────────────────────────────────────────────────────
const NORTH_TIPS = [
  "Luna escaped the coop again. Third time this week. Randy filmed it.",
  "Farmer's Almanac says frost by Thursday. Marguerite's already on it.",
  "The loft light has been on all night. North's been busy up there.",
  "Real talk — Piscataway sunsets hit different when you film them vertical.",
  "Eleanor wants a scene from the 1960s farm. She remembers everything.",
  "Weird NJ tip: the Pine Barrens are 45 mins south. Randy knows a path.",
  "Salem just finished something in the studio. Go look before she hides it.",
  "The Big Red Barn has stories. Ask North to dig one out.",
  "Ken's been in the workbench since 6am. Something's getting over-engineered.",
  "Moon's almost full. Best night this week to film something outdoors.",
];

let northTipTimer = null;
let currentTip = null;
let tipDismissed = false;

export const render = (state) => {
  const wx     = state.weather;
  const hasKey = state.keys.anthropic || state.keys.gemini;
  const user   = state.user;
  const isRain = wx?.condition?.toLowerCase().includes('rain');
  const isSnow = wx?.condition?.toLowerCase().includes('snow');
  const isClear = wx?.condition?.toLowerCase().includes('clear') || wx?.condition?.toLowerCase().includes('sun');

  return `
    <div class="farm-wrap">

      <!-- ANIMATED SKY -->
      <div class="sky-scene">
        ${starField()}
        ${moonHTML(state.moon)}
        ${isRain  ? rainHTML()  : ''}
        ${isSnow  ? snowHTML()  : ''}
      </div>

      <!-- NORTH PEEK TIP -->
      ${currentTip && !tipDismissed ? `
        <div class="north-tip-bar">
          <span class="north-tip-eye">🧠</span>
          <span class="north-tip-text">${currentTip}</span>
          <button class="north-tip-close" onclick="dismissFarmTip()">✕</button>
        </div>` : ''}

      <!-- BIG RED BARN SCENE -->
      <div class="barn-scene">
        ${barnSVG()}

        <!-- WREN'S CHARACTER CUTOUTS -->
        <div class="cutout luna-cutout" title="Luna the Goat">
          <img src="${LUNA_IMG}" alt="Luna"/>
          <div class="cutout-glow luna-glow"></div>
        </div>
        <div class="cutout eleanor-cutout" title="Grand Ma Eleanor" onclick="goTo('cast')">
          <img src="${ELEANOR_IMG}" alt="Grand Ma Eleanor"/>
        </div>
        <div class="cutout salem-cutout" title="Salem" onclick="goTo('cast')">
          <img src="${SALEM_IMG}" alt="Salem"/>
        </div>
      </div>

      <!-- FARM ALMANAC STRIP -->
      <div class="almanac-strip">
        ${wx ? `<span class="alm wx-pill">🌡️ ${wx.temp} · ${wx.condition}</span>` : ''}
        <span class="alm moon-pill">${state.moon.icon} ${state.moon.name}</span>
        <span class="alm loc-pill">📍 Piscataway NJ</span>
        <span class="alm">v${NORTH_VERSION.current}</span>
        ${user
          ? `<span class="alm user-pill">👤 ${user.displayName.split(' ')[0]}</span>`
          : `<span class="alm signin-pill" onclick="handleSignIn()">🔐 Sign In</span>`}
        ${!hasKey ? `<span class="alm warn-pill" onclick="goTo('setup')">⚠ Add API Key</span>` : ''}
      </div>

      <!-- NORTH WELCOME -->
      <div class="welcome-card">
        <div class="wel-avatar">🧠</div>
        <div class="wel-body">
          <div class="wel-label">North · From the Loft</div>
          <div class="wel-msg">
            Hey — welcome to the farm. The door's always open.
            Ken's tinkering, Marguerite's cooking, Randy's underground,
            Salem's creating, Eleanor's watching everything.
            Pick a room and let's make something worth watching.
          </div>
        </div>
      </div>

      <!-- CREW STRIP -->
      <div class="crew-label">THE CREW</div>
      <div class="crew-strip">${crewStrip()}</div>

      <!-- ROOM GRID -->
      <div class="room-grid">
        ${ROOMS.map(r => `
          <button class="room-card" onclick="goTo('${r.id}')"
                  style="--rc:${r.color || '#38bdf8'};border-color:${r.color}44;">
            <div class="rc-emoji">${r.emoji}</div>
            <div class="rc-title">${r.title}</div>
            <div class="rc-desc">${r.desc}</div>
            <div class="rc-enter" style="color:${r.color};">ENTER →</div>
          </button>`).join('')}
      </div>

    </div>

    <style>
      /* ── FARM WRAP ──────────────────────────────────────────── */
      .farm-wrap { padding:0 0 36px; overflow-x:hidden; }

      /* ── SKY ────────────────────────────────────────────────── */
      .sky-scene { position:relative; height:0; overflow:visible; pointer-events:none; }
      .star { position:fixed; border-radius:50%; background:#fff;
                animation:twinkle var(--td,3s) var(--td2,0s) ease-in-out infinite; z-index:1; }
      @keyframes twinkle {
        0%,100% { opacity:var(--op,.3); transform:scale(1); }
        50%      { opacity:1;           transform:scale(1.4); } }

      .moon-orb { position:fixed; top:18px; right:24px; z-index:2;
                   width:52px; height:52px; border-radius:50%;
                   background:radial-gradient(circle at 35% 35%, #fffde7, #f9a825);
                   box-shadow:0 0 28px #f9a82588, 0 0 60px #f9a82522;
                   display:flex; align-items:center; justify-content:center;
                   font-size:1.8em; animation:moonPulse 6s ease-in-out infinite; }
      @keyframes moonPulse {
        0%,100% { box-shadow:0 0 28px #f9a82588,0 0 60px #f9a82522; }
        50%      { box-shadow:0 0 44px #f9a825aa,0 0 90px #f9a82544; } }

      /* ── RAIN / SNOW ────────────────────────────────────────── */
      .rain-drop { position:fixed; top:-20px; width:2px; border-radius:2px;
                    background:linear-gradient(#38bdf888,transparent);
                    animation:rainFall var(--rd,.7s) var(--rd2,0s) linear infinite; z-index:3; pointer-events:none; }
      @keyframes rainFall { to { transform:translateY(110vh); } }
      .snow-flake { position:fixed; top:-20px; color:#fff; font-size:.9em;
                     animation:snowFall var(--sd,4s) var(--sd2,0s) linear infinite; z-index:3; pointer-events:none; opacity:.7; }
      @keyframes snowFall { to { transform:translateY(110vh) rotate(360deg); } }

      /* ── NORTH TIP ──────────────────────────────────────────── */
      .north-tip-bar { display:flex; align-items:center; gap:14px;
                        background:linear-gradient(135deg,rgba(2,132,199,0.18),rgba(14,165,233,0.08));
                        border-bottom:2px solid #38bdf844; border-top:2px solid #38bdf822;
                        padding:13px 22px; animation:tipSlide .4s ease-out; }
      @keyframes tipSlide { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }
      .north-tip-eye  { font-size:1.6em; flex-shrink:0;
                         animation:eyePulse 3s ease-in-out infinite; }
      @keyframes eyePulse { 0%,100%{filter:drop-shadow(0 0 4px #38bdf8)} 50%{filter:drop-shadow(0 0 14px #38bdf8)} }
      .north-tip-text { flex:1; color:#e0f2fe; font-size:.84em; font-weight:600; line-height:1.5; }
      .north-tip-close{ background:none; border:none; color:#475569; cursor:pointer;
                         font-size:1.1em; padding:4px 8px; flex-shrink:0; }
      .north-tip-close:hover { color:#fff; }

      /* ── BARN SCENE ─────────────────────────────────────────── */
      .barn-scene { position:relative; width:100%; max-width:700px;
                     margin:0 auto; padding-top:16px; }
      .barn-scene svg { width:100%; height:auto;
                         filter:drop-shadow(0 6px 40px rgba(153,27,27,0.35)); }

      /* ── CUTOUTS ────────────────────────────────────────────── */
      .cutout { position:absolute; bottom:8%; z-index:10; }
      .cutout img { display:block; height:auto; image-rendering:crisp-edges;
                     filter:drop-shadow(3px 6px 12px rgba(0,0,0,0.7)); }

      .luna-cutout { left:4%; bottom:6%; }
      .luna-cutout img { width:clamp(70px,12vw,140px);
                          animation:lunaHop 4s ease-in-out infinite; }
      @keyframes lunaHop {
        0%,100% { transform:translateY(0) rotate(-2deg); }
        30%     { transform:translateY(-10px) rotate(2deg); }
        60%     { transform:translateY(-4px) rotate(-1deg); } }

      .eleanor-cutout { right:2%; bottom:4%; cursor:pointer; }
      .eleanor-cutout img { width:clamp(60px,10vw,120px);
                             transition:transform .3s; }
      .eleanor-cutout:hover img { transform:scale(1.06) translateY(-4px); }

      .salem-cutout { right:18%; bottom:5%; cursor:pointer; }
      .salem-cutout img { width:clamp(55px,9vw,110px);
                           animation:salemFloat 5s ease-in-out infinite; }
      @keyframes salemFloat {
        0%,100% { transform:translateY(0); filter:drop-shadow(3px 6px 12px rgba(0,0,0,0.7)); }
        50%     { transform:translateY(-7px); filter:drop-shadow(3px 14px 18px rgba(168,85,247,0.5)); } }

      /* ── ALMANAC ────────────────────────────────────────────── */
      .almanac-strip { display:flex; gap:8px; flex-wrap:wrap; padding:14px 22px 10px;
                        align-items:center; }
      .alm { font-size:.62em; font-weight:800; color:#94a3b8;
               background:rgba(15,23,42,0.85); border:1px solid #1e293b;
               border-radius:20px; padding:5px 13px; white-space:nowrap; }
      .wx-pill   { color:#7dd3fc; border-color:#0284c733; }
      .moon-pill { color:#fcd34d; border-color:#f59e0b33; }
      .loc-pill  { color:#86efac; border-color:#22c55e33; }
      .user-pill { color:#c4b5fd; border-color:#7c3aed33; }
      .warn-pill { color:#fbbf24; border-color:#f59e0b55; cursor:pointer; }
      .signin-pill{ color:#38bdf8; border-color:#38bdf844; cursor:pointer; font-weight:900; }

      /* ── WELCOME ────────────────────────────────────────────── */
      .welcome-card { display:flex; gap:16px; align-items:flex-start;
                       margin:10px 22px 22px;
                       background:rgba(14,165,233,0.07);
                       border:2px solid #38bdf833; border-radius:20px;
                       padding:20px 22px; }
      .wel-avatar { width:52px; height:52px; border-radius:50% 50% 50% 8px; flex-shrink:0;
                     background:linear-gradient(135deg,#0ea5e9,#0284c7);
                     display:flex; align-items:center; justify-content:center;
                     font-size:1.5em; box-shadow:0 0 24px rgba(56,189,248,0.45);
                     animation:northGlow 4s ease-in-out infinite; }
      @keyframes northGlow {
        0%,100% { box-shadow:0 0 18px rgba(56,189,248,.4); }
        50%      { box-shadow:0 0 36px rgba(56,189,248,.8); } }
      .wel-label { color:#38bdf8; font-size:.6em; font-weight:900;
                    letter-spacing:2px; text-transform:uppercase; margin-bottom:6px; }
      .wel-msg   { color:#cbd5e1; font-size:.88em; line-height:1.7; }

      /* ── CREW ───────────────────────────────────────────────── */
      .crew-label { font-size:.58em; font-weight:900; color:#334155;
                     letter-spacing:2px; text-transform:uppercase;
                     padding:0 22px; margin-bottom:10px; }
      .crew-strip { display:flex; gap:11px; overflow-x:auto; padding:0 22px 10px;
                     margin-bottom:24px; scrollbar-width:none; }
      .crew-strip::-webkit-scrollbar { display:none; }
      .crew-chip  { display:flex; flex-direction:column; align-items:center; gap:5px;
                     background:rgba(15,23,42,0.85); border:2px solid #1e293b;
                     border-radius:14px; padding:12px 16px; cursor:pointer; flex-shrink:0;
                     min-width:80px; transition:all .2s; }
      .crew-chip:hover { border-color:#38bdf8; transform:translateY(-4px);
                          background:rgba(56,189,248,.08); }
      .crew-icon  { font-size:1.8em; }
      .crew-name  { font-size:.54em; font-weight:900; color:#94a3b8; white-space:nowrap; }

      /* ── ROOM GRID ──────────────────────────────────────────── */
      .room-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr));
                    gap:15px; padding:0 22px; }
      .room-card { background:rgba(15,23,42,0.9); border:2px solid #1e293b;
                    border-radius:20px; padding:22px; cursor:pointer; text-align:left;
                    width:100%; font-family:Georgia,serif; transition:all .25s; }
      .room-card:hover { transform:translateY(-5px); border-color:#38bdf8;
                          box-shadow:0 18px 44px rgba(0,0,0,.55); }
      .rc-emoji { font-size:2.8em; margin-bottom:11px; }
      .rc-title { font-weight:900; font-size:1.05em; color:#fff; margin-bottom:6px; }
      .rc-desc  { color:#64748b; font-size:.76em; line-height:1.6; margin-bottom:12px; }
      .rc-enter { font-size:.64em; font-weight:900; letter-spacing:1px; }
    </style>
  `;
};

export const mount = (state) => {
  // Start North tip cycle
  if (northTipTimer) clearInterval(northTipTimer);
  tipDismissed = false;
  // First tip after 12 seconds
  setTimeout(() => {
    if (state.tab === 'home') {
      currentTip = NORTH_TIPS[Math.floor(Math.random() * NORTH_TIPS.length)];
      tipDismissed = false;
      if (typeof window.render === 'function') window.render();
    }
  }, 12000);
  // Then every 30s
  northTipTimer = setInterval(() => {
    if (state.tab === 'home') {
      currentTip = NORTH_TIPS[Math.floor(Math.random() * NORTH_TIPS.length)];
      tipDismissed = false;
      if (typeof window.render === 'function') window.render();
    }
  }, 30000);
};

window.dismissFarmTip = () => {
  tipDismissed = true;
  if (typeof window.render === 'function') window.render();
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

const crewStrip = () => [
  {i:"👨\u200d🌾",n:"Ken"},
  {i:"👩🏽\u200d🌾",n:"Marguerite"},
  {i:"🪖", n:"Randy"},
  {i:"✨", n:"Salem"},
  {i:"🌑", n:"Shadowblaz"},
  {i:"🐕", n:"Bronzedogg"},
  {i:"🦍", n:"BigTheSqua"},
  {i:"👵", n:"Eleanor"},
].map(c=>`
  <div class="crew-chip" onclick="goTo('cast')">
    <div class="crew-icon">${c.i}</div>
    <div class="crew-name">${c.n}</div>
  </div>`).join('');

const starField = () => {
  const stars = [];
  for (let i=0; i<60; i++) {
    const x   = Math.random()*100;
    const y   = Math.random()*35;
    const sz  = (Math.random()*2+1).toFixed(1);
    const td  = (Math.random()*4+2).toFixed(1);
    const td2 = (Math.random()*5).toFixed(1);
    const op  = (Math.random()*.5+.2).toFixed(2);
    stars.push(`<div class="star" style="left:${x}%;top:${y}%;width:${sz}px;height:${sz}px;--td:${td}s;--td2:${td2}s;--op:${op};"></div>`);
  }
  return stars.join('');
};

const moonHTML = (moon) =>
  `<div class="moon-orb" title="${moon.name}">${moon.icon}</div>`;

const rainHTML = () => {
  let drops = '';
  for (let i=0; i<40; i++) {
    const x  = Math.random()*100;
    const h  = Math.random()*18+8;
    const rd = (Math.random()*.5+.5).toFixed(2);
    const rd2= (Math.random()*1).toFixed(2);
    drops += `<div class="rain-drop" style="left:${x}%;height:${h}px;--rd:${rd}s;--rd2:${rd2}s;"></div>`;
  }
  return drops;
};

const snowHTML = () => {
  let flakes = '';
  for (let i=0; i<30; i++) {
    const x  = Math.random()*100;
    const sd = (Math.random()*4+3).toFixed(1);
    const sd2= (Math.random()*5).toFixed(1);
    flakes += `<div class="snow-flake" style="left:${x}%;--sd:${sd}s;--sd2:${sd2}s;">❄</div>`;
  }
  return flakes;
};

// ── BIG RED BARN SVG ──────────────────────────────────────────────────────────
const barnSVG = () => `
  <svg viewBox="-2 -30 434 275" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>
        @keyframes barnWheelSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes vaneSway       { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(14deg)} }
        @keyframes northScan      { 0%,100%{fill:#38bdf8} 40%{fill:#7dd3fc} 70%{fill:#0ea5e9} }
        @keyframes loftGlow       { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes chickenBob     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes gardenSway     { 0%,100%{transform:rotate(-3deg)} 50%{transform:rotate(3deg)} }
        .barn-wheel { transform-box:fill-box; transform-origin:center; animation:barnWheelSpin 5s linear infinite; }
        .barn-vane  { transform-box:fill-box; transform-origin:2px 0px; animation:vaneSway 3.5s ease-in-out infinite; }
        .north-iris { animation:northScan 4s ease-in-out infinite; }
        .loft-light { animation:loftGlow 3s ease-in-out infinite; }
        .chicken    { transform-box:fill-box; transform-origin:center bottom; animation:chickenBob 1.2s ease-in-out infinite; }
        .flower     { transform-box:fill-box; transform-origin:center bottom; animation:gardenSway 2.5s ease-in-out infinite; }
      </style>
      <radialGradient id="barnGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#dc262622"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
      <radialGradient id="loftGlowGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#38bdf866"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>

    <!-- GROUND / GRASS -->
    <rect x="-2" y="228" width="438" height="20" fill="#166534" rx="3" opacity=".9"/>
    <rect x="-2" y="233" width="438" height="15" fill="#14532d" opacity=".7"/>

    <!-- WINDMILL TOWER -->
    <line x1="5"  y1="228" x2="19" y2="108" stroke="#7a6040" stroke-width="2.2" opacity=".85"/>
    <line x1="39" y1="228" x2="25" y2="108" stroke="#7a6040" stroke-width="2.2" opacity=".85"/>
    <line x1="8"  y1="215" x2="36" y2="200" stroke="#6a5030" stroke-width="1.1" opacity=".7"/>
    <line x1="36" y1="215" x2="8"  y2="200" stroke="#6a5030" stroke-width="1.1" opacity=".7"/>
    <line x1="10" y1="190" x2="34" y2="175" stroke="#6a5030" stroke-width="1"   opacity=".7"/>
    <line x1="34" y1="190" x2="10" y2="175" stroke="#6a5030" stroke-width="1"   opacity=".7"/>
    <ellipse cx="22" cy="228" rx="17" ry="5" fill="#1a3a5c" stroke="#2a5a80" stroke-width="1.2" opacity=".6"/>
    <circle  cx="22" cy="108" r="5" fill="#9a8060" opacity=".95"/>
    <g transform="translate(22,108)">
      <g class="barn-wheel">
        <path d="M0 0 L-3-32 L3-32 Z"    fill="#a08860" opacity=".9"/>
        <path d="M0 0 L32-3  L32 3   Z"  fill="#a08860" opacity=".9"/>
        <path d="M0 0 L-3 32 L3 32   Z"  fill="#a08860" opacity=".9"/>
        <path d="M0 0 L-32 3  L-32-3 Z"  fill="#a08860" opacity=".9"/>
        <path d="M0 0 L18-26 L22-22 Z"   fill="#a08860" opacity=".75"/>
        <path d="M0 0 L26 18 L22 22  Z"  fill="#a08860" opacity=".75"/>
        <path d="M0 0 L-18 26 L-22 22 Z" fill="#a08860" opacity=".75"/>
        <path d="M0 0 L-26-18 L-22-22 Z" fill="#a08860" opacity=".75"/>
        <circle cx="0" cy="0" r="32" fill="none" stroke="#8a7050" stroke-width="1.5" opacity=".5"/>
        <circle cx="0" cy="0" r="4"  fill="#7a6040"/>
      </g>
    </g>
    <path d="M 26 108 L 60 95 L 60 122 Z" fill="#6a5030" opacity=".7"/>

    <!-- PINE TREES -->
    <path d="M 5 228 L 30 140 L 55 228 Z"     fill="#14532d" opacity=".9"/>
    <path d="M 15 228 L 35 160 L 55 228 Z"    fill="#166534" opacity=".5"/>
    <path d="M 345 228 L 375 138 L 405 228 Z" fill="#14532d" opacity=".9"/>
    <path d="M 350 228 L 378 158 L 406 228 Z" fill="#166534" opacity=".5"/>

    <!-- SILO -->
    <ellipse cx="392" cy="228" rx="28" ry="6" fill="#000" opacity=".2"/>
    <rect x="366" y="32" width="54" height="198" fill="#c8c0b0" stroke="#9a9288" stroke-width="2"/>
    <path d="M 366 32 Q 354 130 366 228" fill="#a8a098" opacity=".8"/>
    <path d="M 420 32 Q 432 130 420 228" fill="#e0d8c8" opacity=".6"/>
    <!-- silo horizontal bands -->
    <line x1="366" y1="80"  x2="420" y2="80"  stroke="#9a9288" stroke-width="1" opacity=".5"/>
    <line x1="366" y1="120" x2="420" y2="120" stroke="#9a9288" stroke-width="1" opacity=".5"/>
    <line x1="366" y1="160" x2="420" y2="160" stroke="#9a9288" stroke-width="1" opacity=".5"/>
    <line x1="366" y1="200" x2="420" y2="200" stroke="#9a9288" stroke-width="1" opacity=".5"/>
    <path d="M 361 34 Q 393 -12 425 34 Z" fill="#888078" stroke="#787068" stroke-width="2"/>
    <ellipse cx="393" cy="34" rx="30" ry="7" fill="#989088" stroke="#787068" stroke-width="1.5"/>
    <rect x="389" y="-16" width="8" height="18" rx="2" fill="#686058"/>

    <!-- MAIN BARN BODY -->
    <rect x="55" y="97" width="230" height="131" fill="#b91c1c" stroke="#7f1d1d" stroke-width="1"/>
    <!-- barn shadow/depth -->
    <rect x="55" y="97" width="14" height="131" fill="#7f1d1d" opacity=".5"/>
    <rect x="271" y="97" width="14" height="131" fill="#450a0a" opacity=".5"/>
    <!-- barn roof -->
    <polygon points="45,99 170,20 295,99" fill="#991b1b" stroke="#450a0a" stroke-width="3"/>
    <!-- roof shading -->
    <polygon points="45,99 107,59 107,99" fill="#7f1d1d" opacity=".4"/>
    <!-- barn glow under roof -->
    <ellipse cx="170" cy="99" rx="115" ry="12" fill="url(#barnGlow)"/>

    <!-- WIND VANE -->
    <line x1="170" y1="20" x2="170" y2="2" stroke="#c4901a" stroke-width="2"/>
    <circle cx="170" cy="2" r="2.5" fill="#d4a017"/>
    <g transform="translate(170,10)">
      <g class="barn-vane">
        <polygon points="0,-6 3,0 0,-2 -3,0" fill="#d4a017"/>
        <path d="M0-2 L-6 5 L-3 3 L-6 8 L0 4 L6 8 L3 3 L6 5 Z" fill="#c4901a"/>
      </g>
    </g>

    <!-- NORTH'S LOFT WINDOW -->
    <rect x="143" y="55" width="54" height="40" rx="4" fill="#020617" stroke="#38bdf8" stroke-width="2.5"/>
    <!-- loft glow behind window -->
    <ellipse cx="170" cy="75" rx="30" ry="20" fill="url(#loftGlowGrad)" class="loft-light"/>
    <circle cx="170" cy="75" r="12" fill="#061228" opacity=".9"/>
    <circle cx="170" cy="75" r="6"  fill="#38bdf8" class="north-iris"/>
    <circle cx="170" cy="75" r="2.5" fill="#010a18"/>
    <circle cx="172" cy="72" r="1.2" fill="#fff" opacity=".75"/>
    <!-- loft label -->
    <rect x="145" y="44" width="50" height="13" rx="3" fill="#010c1e" stroke="#38bdf833" stroke-width="1"/>
    <text x="170" y="54" text-anchor="middle" font-size="7" font-weight="900"
          font-family="Georgia,serif" fill="#38bdf8" letter-spacing="2">NORTH</text>

    <!-- LOFT LADDER (left side of barn) -->
    <line x1="68" y1="99" x2="68" y2="160" stroke="#5a4020" stroke-width="3" stroke-linecap="round"/>
    <line x1="80" y1="99" x2="80" y2="160" stroke="#5a4020" stroke-width="3" stroke-linecap="round"/>
    <line x1="68" y1="112" x2="80" y2="112" stroke="#5a4020" stroke-width="2"/>
    <line x1="68" y1="124" x2="80" y2="124" stroke="#5a4020" stroke-width="2"/>
    <line x1="68" y1="136" x2="80" y2="136" stroke="#5a4020" stroke-width="2"/>
    <line x1="68" y1="148" x2="80" y2="148" stroke="#5a4020" stroke-width="2"/>

    <!-- MAIN BARN DOORS -->
    <rect x="132" y="152" width="76" height="76" fill="#3b0000"/>
    <line x1="132" y1="152" x2="208" y2="228" stroke="#7f1d1d" stroke-width="1.5"/>
    <line x1="208" y1="152" x2="132" y2="228" stroke="#7f1d1d" stroke-width="1.5"/>
    <line x1="170" y1="152" x2="170" y2="228" stroke="#7f1d1d" stroke-width="1.5"/>
    <!-- door handles -->
    <circle cx="162" cy="193" r="3" fill="#d97706"/>
    <circle cx="178" cy="193" r="3" fill="#d97706"/>

    <!-- BARN SIGN -->
    <rect x="112" y="134" width="116" height="19" rx="3" fill="#2a0606" stroke="#7a1a1a" stroke-width="1.5"/>
    <text x="170" y="147" text-anchor="middle" font-size="8.5" font-weight="900"
          font-family="Georgia,serif" fill="#fca5a5" letter-spacing="1.2">BIG RED BARN</text>

    <!-- SIDE WINDOWS (barn) -->
    <rect x="88"  y="120" width="24" height="18" rx="2" fill="#3b0000" stroke="#7f1d1d" stroke-width="1.5"/>
    <line x1="100" y1="120" x2="100" y2="138" stroke="#7f1d1d" stroke-width="1"/>
    <rect x="226" y="120" width="24" height="18" rx="2" fill="#3b0000" stroke="#7f1d1d" stroke-width="1.5"/>
    <line x1="238" y1="120" x2="238" y2="138" stroke="#7f1d1d" stroke-width="1"/>

    <!-- SHED / CHICKEN COOP -->
    <rect x="303" y="165" width="62" height="63" fill="#92400e" stroke="#451a03" stroke-width="2"/>
    <polygon points="298,165 334,140 370,165" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>
    <!-- coop window -->
    <rect x="316" y="175" width="18" height="14" rx="2" fill="#020617" stroke="#78350f" stroke-width="1"/>
    <line x1="325" y1="175" x2="325" y2="189" stroke="#78350f" stroke-width="1"/>
    <!-- coop door -->
    <rect x="320" y="195" width="18" height="33" rx="2" fill="#3b1a00"/>
    <!-- coop label -->
    <text x="334" y="160" text-anchor="middle" font-size="5.5" font-weight="900"
          font-family="Georgia,serif" fill="#fcd34d" opacity=".8">COOP</text>
    <!-- CHICKENS -->
    <g class="chicken" style="transform-origin:318px 228px">
      <ellipse cx="318" cy="224" rx="7" ry="5"  fill="#fef3c7" stroke="#d97706" stroke-width="1"/>
      <circle  cx="323" cy="220" r="4"           fill="#fef3c7" stroke="#d97706" stroke-width="1"/>
      <polygon points="325,219 328,218 326,221"  fill="#ef4444"/>
      <circle  cx="324" cy="220" r="1"           fill="#1e293b"/>
    </g>
    <g class="chicken" style="transform-origin:307px 228px;animation-delay:.6s">
      <ellipse cx="307" cy="225" rx="6" ry="4.5" fill="#fde68a" stroke="#d97706" stroke-width="1"/>
      <circle  cx="311" cy="221" r="3.5"          fill="#fde68a" stroke="#d97706" stroke-width="1"/>
      <polygon points="313,220 316,219 314,222"   fill="#ef4444"/>
    </g>

    <!-- GARDEN (foreground) -->
    <!-- garden bed -->
    <rect x="220" y="218" width="72" height="12" rx="3" fill="#3d1f00" stroke="#5a3010" stroke-width="1"/>
    <!-- flowers -->
    <g class="flower" style="transform-origin:234px 218px">
      <line x1="234" y1="218" x2="234" y2="205" stroke="#22c55e" stroke-width="2"/>
      <circle cx="234" cy="204" r="5" fill="#ef4444"/>
      <circle cx="234" cy="204" r="2" fill="#fcd34d"/>
    </g>
    <g class="flower" style="transform-origin:248px 218px;animation-delay:.4s">
      <line x1="248" y1="218" x2="248" y2="203" stroke="#16a34a" stroke-width="2"/>
      <circle cx="248" cy="202" r="5" fill="#f97316"/>
      <circle cx="248" cy="202" r="2" fill="#fef08a"/>
    </g>
    <g class="flower" style="transform-origin:262px 218px;animation-delay:.8s">
      <line x1="262" y1="218" x2="262" y2="206" stroke="#15803d" stroke-width="2"/>
      <circle cx="262" cy="205" r="5" fill="#a855f7"/>
      <circle cx="262" cy="205" r="2" fill="#fff"/>
    </g>
    <g class="flower" style="transform-origin:276px 218px;animation-delay:1.2s">
      <line x1="276" y1="218" x2="276" y2="204" stroke="#22c55e" stroke-width="2"/>
      <circle cx="276" cy="203" r="5" fill="#f43f5e"/>
      <circle cx="276" cy="203" r="2" fill="#fcd34d"/>
    </g>

    <!-- GROUND DETAILS -->
    <rect x="-2" y="228" width="438" height="4" fill="#15803d" opacity=".8" rx="2"/>
  </svg>
`;
