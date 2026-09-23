-- ISOC MDH72 — 5D Security Threat Framework
-- Source of truth for the new 5-domain framework only.
-- This migration mirrors the production schema/data applied to Supabase project riuebseoczwwifxezcwj.

CREATE TABLE IF NOT EXISTS public.security_threat_5d_framework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_code text NOT NULL UNIQUE,
  framework_name text NOT NULL,
  description text,
  sort_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_threat_5d_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_code text NOT NULL REFERENCES public.security_threat_5d_framework(framework_code) ON UPDATE CASCADE ON DELETE CASCADE,
  item_code text NOT NULL,
  item_name text NOT NULL,
  sort_order integer NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(framework_code, item_code)
);

CREATE INDEX IF NOT EXISTS idx_security_threat_5d_items_framework
  ON public.security_threat_5d_items(framework_code, sort_order);

ALTER TABLE public.security_threat_5d_framework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_threat_5d_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS security_threat_5d_framework_read ON public.security_threat_5d_framework;
CREATE POLICY security_threat_5d_framework_read
  ON public.security_threat_5d_framework FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS security_threat_5d_items_read ON public.security_threat_5d_items;
CREATE POLICY security_threat_5d_items_read
  ON public.security_threat_5d_items FOR SELECT USING (is_active = true);

GRANT SELECT ON public.security_threat_5d_framework TO anon, authenticated;
GRANT SELECT ON public.security_threat_5d_items TO anon, authenticated;

INSERT INTO public.security_threat_5d_framework (framework_code,framework_name,description,sort_order) VALUES
('D01','ด้านการป้องกันและปราบปรามยาเสพติด','ภัยคุกคามหลักที่ส่งผลกระทบต่อความสงบเรียบร้อยและโครงสร้างทางสังคมในระดับชุมชน',1),
('D02','ด้านความมั่นคงรูปแบบใหม่ (Non-Traditional Threats)','ภัยคุกคามที่ไม่ได้เกิดจากกองกำลังทหาร แต่กระทบต่อเศรษฐกิจ สังคม และความสงบสุขของประชาชน',2),
('D03','ด้านการจัดการทรัพยากรธรรมชาติและสิ่งแวดล้อม','ภัยคุกคามที่ทำลายฐานเศรษฐกิจชุมชนและทรัพยากรที่สำคัญของชาติ',3),
('D04','ด้านบรรเทาสาธารณภัยและภัยพิบัติ','การเตรียมพร้อมและเข้าเผชิญเหตุเพื่อลดความสูญเสียต่อชีวิตและทรัพย์สินของประชาชน',4),
('D05','ด้านการป้องปรามความขัดแย้งทางสังคมและการเทิดทูนสถาบันหลัก','การดูแลความสงบเรียบร้อยไม่ให้ความเห็นที่แตกต่างลุกลามเป็นความรุนแรงจนกระทบความมั่นคงภายใน',5)
ON CONFLICT (framework_code) DO UPDATE SET framework_name=EXCLUDED.framework_name,description=EXCLUDED.description,sort_order=EXCLUDED.sort_order,is_active=true,updated_at=now();

INSERT INTO public.security_threat_5d_items (framework_code,item_code,item_name,sort_order) VALUES
('D01','D01-01','เส้นทางผ่านลำเลียงยาเสพติดล็อตใหญ่จากชายแดนเข้าสู่ภาคกลาง',1),('D01','D01-02','จุดพักยา (Safehouse)',2),('D01','D01-03','เครือข่ายผู้ค้ารายย่อยในสถานบันเทิง ชุมชนแออัด และรอบสถานศึกษา',3),('D01','D01-04','ยาเสพติดชนิดใหม่ / การผสมสารเคมีที่เป็นอันตรายในกลุ่มวัยรุ่น',4),
('D02','D02-01','แรงงานต่างด้าวผิดกฎหมาย / ลักลอบขนคนข้ามแดนตามช่องทางธรรมชาติ',1),('D02','D02-02','การค้ามนุษย์',2),('D02','D02-03','อาชญากรรมข้ามชาติ',3),('D02','D02-04','ไซเบอร์',4),('D02','D02-05','แก๊งคอลเซ็นเตอร์',5),('D02','D02-06','การหลอกลวงลงทุนออนไลน์',6),('D02','D02-07','การโจรกรรมข้อมูลระบบไอทีของโรงพยาบาลหรือหน่วยงานรัฐ',7),('D02','D02-08','อาวุธสงคราม',8),('D02','D02-09','แก๊งทวงหนี้นอกระบบที่ใช้ความรุนแรง',9),('D02','D02-10','การพนันออนไลน์/ออฟไลน์ขนาดใหญ่',10),
('D03','D03-01','การตัดไม้ทำลายป่า',1),('D03','D03-02','การลักลอบตัดไม้พะยูงหรือไม้หวงห้ามในเขตอุทยานแห่งชาติ',2),('D03','D03-03','การบุกรุกที่ดินของรัฐ',3),('D03','D03-04','การแผ้วถางป่าสงวน',4),('D03','D03-05','รีสอร์ต / สถานที่ท่องเที่ยว / เกษตรกรรมเชิงเดี่ยวในพื้นที่บุกรุก',5),('D03','D03-06','การลักลอบทิ้งกากสารเคมีอุตสาหกรรม',6),('D03','D03-07','การทำเหมืองแร่ผิดกฎหมาย',7),('D03','D03-08','การดูดทรายในแม่น้ำสายหลักโดยไม่ได้รับอนุญาตจนตลิ่งทรุดตัว',8),
('D04','D04-01','PM2.5 จากการลักลอบเผาป่าและตอซังเกษตรกรรม',1),('D04','D04-02','อุทกภัย',2),('D04','D04-03','น้ำป่าไหลหลาก',3),('D04','D04-04','การตัดขาดเส้นทางคมนาคม',4),('D04','D04-05','ดินโคลนถล่ม / ดินสไลด์',5),('D04','D04-06','ภัยแล้ง',6),('D04','D04-07','การขาดแคลนน้ำอุปโภคบริโภคและน้ำเพื่อการเกษตร',7),('D04','D04-08','ความขัดแย้งแย่งชิงน้ำระหว่างชุมชน',8),
('D05','D05-01','การบิดเบือนข้อมูลข่าวสาร (Fake News)',1),('D05','D05-02','ข่าวปลอมเพื่อสร้างความตื่นตระหนก',2),('D05','D05-03','ข่าวปลอมเพื่อยุยงให้เกิดความแตกแยกในชุมชน',3),('D05','D05-04','ความขัดแย้งมวลชน',4),('D05','D05-05','ข้อพิพาทระหว่างกลุ่มทุนกับชาวบ้าน',5),('D05','D05-06','ปัญหาโรงงานอุตสาหกรรมปล่อยมลพิษ',6),('D05','D05-07','โครงสร้างพื้นฐานขนาดใหญ่ที่ขัดแย้งกับวิถีชุมชน',7),('D05','D05-08','การเคลื่อนไหวที่เข้าข่ายบ่อนทำลายหรือสร้างความเกลียดชังต่อสถาบันชาติ ศาสนา พระมหากษัตริย์ ทั้งในพื้นที่จริงและโลกออนไลน์',8)
ON CONFLICT (framework_code,item_code) DO UPDATE SET item_name=EXCLUDED.item_name,sort_order=EXCLUDED.sort_order,is_active=true,updated_at=now();
