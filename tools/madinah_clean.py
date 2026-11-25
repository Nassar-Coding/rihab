"""Rihab Madinah: remove the demo wording from the screens, matching Rihab Makkah.
Products, homes and opportunities carry no demo badge. The request sheets, item pages
and My requests show an information note: the request is saved in My requests and can
be edited or withdrawn at any time. Nothing is sold or paid for in the app, and no
screen says a request was sent."""
import re, sys
PATH = sys.argv[1]
s = open(PATH, encoding="utf-8").read()

def rep(a, b, count=1):
    global s
    n = s.count(a)
    if n != count:
        raise SystemExit(f"expected {count}× got {n}: {a[:100]!r}")
    s = s.replace(a, b)

NOTE_AR = "يُحفظ طلبك في «طلباتي»، وتقدر تعدّله أو تسحبه في أي وقت."
NOTE_EN = "Your request is saved in My requests, where you can edit or withdraw it at any time."

# Assistant answers
rep('const DEMO = T2("هذا عرض تجريبي: الطلب يُحفظ في «طلباتي» على جهازك فقط، ولا يُرسل إلى أي بائع أو جهة.", "This is a demo: a request is saved in My requests on your device only, and isn\'t sent to any seller or organisation.");',
    'const DEMO = T2("يُحفظ كل طلب في «طلباتي»، وتقدر تعدّله أو تسحبه في أي وقت.", "Each request is saved in My requests, where you can edit or withdraw it at any time.");')
rep('افتح المنتج وسجّل طلبك منه. هذا عرض تجريبي: الأسعار للعرض فقط، والطلب يُحفظ في «طلباتي» على جهازك ولا يُرسل إلى أي بائع.`,',
    'افتح المنتج وسجّل طلبك منه، ويُحفظ في «طلباتي» وتقدر تعدّله أو تسحبه في أي وقت.`,')
rep("Open a product and record your request from it. This is a demo: the prices are for display, and the request is saved in My requests on your device and isn't sent to any seller.`);",
    "Open a product and record your request from it; it's saved in My requests, where you can edit or withdraw it at any time.`);")
rep('${one ? "هو مثال توضيحي لعرض فكرة القسم وليس عقارًا معروضًا فعلًا، وبلا سعر" : "هي أمثلة توضيحية لعرض فكرة القسم وليست عقارات معروضة فعلًا، وبلا أسعار"}. تقدر تطلب التفاصيل من صفحتها، ويُحفظ طلبك في «طلباتي» على جهازك فقط.`,',
    '${one ? "لا نعرض له سعرًا" : "ولا نعرض لها أسعارًا"}. تقدر تطلب التفاصيل من صفحتها، ويُحفظ طلبك في «طلباتي».`,')
rep('${one ? "It\'s a demo example showing how the section works — not a real home on offer — and it has no price" : "They\'re demo examples showing how the section works — not real homes on offer — and they have no prices"}. You can request details from its page; the request is only saved in My requests on your device.`);',
    '${one ? "No price is shown for it" : "No prices are shown for them"}. You can request details from its page, and the request is saved in My requests.`);')
rep('«استثمر في المدينة» دليل تعريفي بفرص الأعمال، والفرص فيه أمثلة توضيحية: ${titles("opp", ids)}.', '«استثمر في المدينة» دليل تعريفي بفرص الأعمال: ${titles("opp", ids)}.')
rep('تقدر تستكشف الفرصة وتسجّل اهتمامك، ويُحفظ في «طلباتي» على جهازك فقط.`,', 'تقدر تستكشف الفرصة وتسجّل اهتمامك، ويُحفظ في «طلباتي».`,')
rep('Invest in Madinah is an introductory directory of business opportunities, and the ones in it are demo examples: ${titles("opp", ids)}.', 'Invest in Madinah is an introductory directory of business opportunities: ${titles("opp", ids)}.')
rep("You can explore an opportunity and register interest; it's only saved in My requests on your device.`);", "You can explore an opportunity and register interest; it's saved in My requests.`);")

# object page: contact action note
rep('<span data-demo>{tx("يُحفظ طلبك في «طلباتي» على هذا الجهاز — لا يُرسل إلى مقدّم الخدمة في هذا العرض التجريبي", "Your request is saved in My requests on this device — it isn\'t sent to the provider in this demo")}</span>',
    'tx("يُحفظ طلبك في «طلباتي»، وتقدر تعدّله أو تسحبه في أي وقت", "Your request is saved in My requests, where you can edit or withdraw it at any time")')

# shared note, badge and note component
s, n = re.subn(r'const DEMO_TAG = \[[^\]]*\];\nconst DEMO_REQUEST_NOTE = \[[^\]]*\];', f'const REQUEST_NOTE = ["{NOTE_AR}",\n  "{NOTE_EN}"];', s, flags=re.S)
if n != 1: raise SystemExit(f"notes: {n}")
s, n = re.subn(r'function DemoTag\(\{ onPhoto \}\) \{\n  return \(\n.*?\n  \);\n\}\nfunction DemoNote\(\{ children \}\) \{\n  return \(\n    <div data-demo ',
               '/* items carry no "example" badge (kept as a no-op so call sites stay simple) */\nfunction DemoTag() { return null; }\nfunction InfoNote({ children }) {\n  return (\n    <div data-info-note ', s, flags=re.S)
if n != 1: raise SystemExit(f"components: {n}")
s = s.replace("<DemoNote>", "<InfoNote>").replace("</DemoNote>", "</InfoNote>")
rep("{L2(DEMO_REQUEST_NOTE)}", "{L2(REQUEST_NOTE)}", 2)

# request done, product price and notes, homes, opportunities
rep('{tx("أضفناه إلى «طلباتي» على هذا الجهاز.", "Added to My requests on this device.")}', '{tx("أضفناه إلى «طلباتي».", "Added to My requests.")}')
rep('<div style={{ fontSize: 13, color: T.muted, lineHeight: 1.8, marginTop: 6 }} data-demo>{tx("لم يُرسل إلى أي جهة — هذا عرض تجريبي.", "It hasn\'t been sent to anyone — this is a demo.")}</div>',
    '<div style={{ fontSize: 13, color: T.muted, lineHeight: 1.8, marginTop: 6 }}>{tx("تقدر تعدّله أو تسحبه من «طلباتي» في أي وقت.", "You can edit or withdraw it from My requests at any time.")}</div>')
rep('<span data-demo style={{ fontSize: 11.5, color: T.muted, fontWeight: 700 }}>{tx("سعر للعرض التجريبي", "Demo price")}</span>',
    '<span style={{ fontSize: 11.5, color: T.muted, fontWeight: 700 }}>{tx("سعر تقديري", "Indicative price")}</span>')
rep('{tx("منتج للعرض التجريبي: لا يُباع ولا يُدفع ثمنه عبر التطبيق. طلبك يُحفظ في «طلباتي» فقط.", "A demo product: nothing is sold or paid for in the app. Your request is only saved in My requests.")}',
    '{tx("لا يتم البيع أو الدفع عبر التطبيق. يُحفظ طلبك في «طلباتي»، وتقدر تعدّله أو تسحبه في أي وقت.", "Nothing is sold or paid for in the app. Your request is saved in My requests, where you can edit or withdraw it at any time.")}')
rep('{tx("أمثلة توضيحية لعرض فكرة هذا القسم — ليست عقارات معروضة فعلًا، وبلا أسعار. «اطلب التفاصيل» يحفظ طلبك في «طلباتي» فقط.", "Demo examples showing how this section works — not real homes on offer, and without prices. Request details only saves your request in My requests.")}',
    '{tx("شقق وفلل للإيجار أو التملك، وإقامات ممتدة في المدينة. سجّل اهتمامك أو اطلب التفاصيل، وتابع طلبك في «طلباتي».", "Apartments and villas to rent or own, and extended stays across Madinah. Register interest or request details, and follow your request in My requests.")}')
rep('{tx("لا أمثلة بهذا الاختيار", "No examples for this choice")}', '{tx("لا نتائج بهذا الاختيار", "Nothing matches this choice")}')
rep('{tx("لم نعد نجد هذا المثال", "We can\'t find this example")}', '{tx("لم نعد نجد هذه الصفحة", "We can\'t find this page")}')
rep('{tx("مثال توضيحي لعرض الفكرة — ليس عقارًا معروضًا فعلًا، ولا نعرض له سعرًا.", "A demo example to show the idea — not a real home on offer, and no price is shown for it.")}',
    '{tx("لا نعرض سعرًا لهذا العقار. اطلب التفاصيل أو سجّل اهتمامك، ويُحفظ طلبك في «طلباتي».", "No price is shown for this home. Request details or register interest, and your request is saved in My requests.")}')
rep('<InfoNote>{L2(INVEST_NOTE)} {tx("الفرص المعروضة أمثلة توضيحية.", "The opportunities shown are demo examples.")}</InfoNote>', '<InfoNote>{L2(INVEST_NOTE)}</InfoNote>')
rep('{tx("هذه الفرصة مثال توضيحي، و«سجّل اهتمامك» يحفظ اهتمامك في «طلباتي» على هذا الجهاز فقط.", "This opportunity is a demo example, and Register interest only saves your interest in My requests on this device.")}',
    '{tx("«سجّل اهتمامك» يحفظ اهتمامك في «طلباتي».", "Register interest saves your interest in My requests.")}')

# photo credit fallback and the orphan offers line
rep('"صورة عامة من مكتبة النموذج": "Generic photo from the prototype library",', '"صورة عامة من مكتبة الصور": "Generic photo from the photo library",')
rep('credit: PHOTO_CREDIT[k] || "صورة عامة من مكتبة النموذج" }', 'credit: PHOTO_CREDIT[k] || "صورة عامة من مكتبة الصور" }')

left = re.findall(r'data-demo|DEMO_TAG|DEMO_REQUEST_NOTE|DemoNote', s)
if left: raise SystemExit(f"left: {left}")
open(PATH, "w", encoding="utf-8").write(s)
print("madinah cleaned")
