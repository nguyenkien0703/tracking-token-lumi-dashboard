--
-- PostgreSQL database dump
--

\restrict 3scctEHiAv0PIhUfdCn8lqGDZNiJT0HZwGKHDkhfQqcjnNVjuOefYHCqLFHlbzM

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: employee_roster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employee_roster (
    email text NOT NULL,
    full_name text,
    department text,
    source text,
    added_at timestamp with time zone DEFAULT now() NOT NULL,
    added_by text
);


--
-- Name: history_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.history_entries (
    id text NOT NULL,
    "userId" integer,
    "sessionId" text,
    model text,
    "promptTokens" integer DEFAULT 0,
    "completionTokens" integer DEFAULT 0,
    "totalTokens" integer DEFAULT 0,
    "totalCostUsd" double precision DEFAULT 0,
    "createdAt" text,
    cache_read_tokens integer DEFAULT 0
);


--
-- Name: releases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.releases (
    id integer NOT NULL,
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: releases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.releases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: releases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.releases_id_seq OWNED BY public.releases.id;


--
-- Name: sync_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sync_state (
    id integer DEFAULT 1 NOT NULL,
    "lastSyncAt" text,
    "totalRecords" integer DEFAULT 0,
    status text DEFAULT 'idle'::text
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    "userId" integer NOT NULL,
    "firstName" text,
    "lastName" text,
    email text,
    "avatarUrl" text,
    "userName" text,
    "updatedAt" text,
    first_seen_at timestamp with time zone,
    last_active_at timestamp with time zone
);


--
-- Name: releases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.releases ALTER COLUMN id SET DEFAULT nextval('public.releases_id_seq'::regclass);


--
-- Data for Name: employee_roster; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employee_roster (email, full_name, department, source, added_at, added_by) FROM stdin;
huyvu@savameta.com	Vũ Đình Huy	BOD	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.294171+00	ai-dev3@savameta.com
nhunglth@savameta.com	Lê Thị Hồng Nhung	Nhân sự - Văn hóa	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.298811+00	ai-dev3@savameta.com
nguyentienminh@savameta.com	Nguyễn Tiến Minh	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.30037+00	ai-dev3@savameta.com
nguyenhuuthang@savameta.com	Nguyễn Hữu Thắng	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.301471+00	ai-dev3@savameta.com
nguyenmanhhung@savameta.com	Nguyễn Mạnh Hùng	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.303287+00	ai-dev3@savameta.com
nguyenquanghuy@savameta.com	Nguyễn Quang Huy	Đồ hoạ & Sáng tạo	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.304548+00	ai-dev3@savameta.com
hadv@savameta.com	Đinh Việt Hà	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.305864+00	ai-dev3@savameta.com
sontv@savameta.com	Trần Văn Sơn	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.307017+00	ai-dev3@savameta.com
kienlt@savameta.com	Lê Trung Kiên	Hạ tầng & Bảo mật	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.308023+00	ai-dev3@savameta.com
tranngoctao@savameta.com	Trần Ngọc Tạo	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.309178+00	ai-dev3@savameta.com
nguyenkimlong@savameta.com	Nguyễn Kim Long	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.310129+00	ai-dev3@savameta.com
baonguyenngoc@savameta.com	Nguyễn Ngọc Bảo	Đồ hoạ & Sáng tạo	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.31096+00	ai-dev3@savameta.com
nhungnt@savameta.com	Nguyễn Thị Nhung	Tài chính - Kế toán	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.311731+00	ai-dev3@savameta.com
tranchau@savameta.com	Trần Thị Kim Châu	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.312502+00	ai-dev3@savameta.com
trieunguyetminh@savameta.com	Triệu Nguyệt Minh	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.313289+00	ai-dev3@savameta.com
lamlh@savameta.com	Lý Hồng Lâm	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.31437+00	ai-dev3@savameta.com
linhtd@savameta.com	Trần Diệu Linh	Nhân sự - Văn hóa	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.31528+00	ai-dev3@savameta.com
thanhth@savameta.com	Trần Hữu Thành	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.31667+00	ai-dev3@savameta.com
trangctt@savameta.com	Cao Thị Thu Trang	Đồ hoạ & Sáng tạo	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.317551+00	ai-dev3@savameta.com
tuongtt@savameta.com	Tạ Tuấn Tường	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.318411+00	ai-dev3@savameta.com
tanpq@savameta.com	Phạm Quang Tân	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.31939+00	ai-dev3@savameta.com
minhhn@savameta.com	Hoàng Nhật Minh	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.320723+00	ai-dev3@savameta.com
linhdd@savameta.com	Đặng Doãn Linh	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.32226+00	ai-dev3@savameta.com
khangnt@savameta.com	Nguyễn Tài Khang	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.323427+00	ai-dev3@savameta.com
hangnt1@savameta.com	Nguyễn Thúy Hằng	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.324833+00	ai-dev3@savameta.com
anhlt@savameta.com	Lê Tuấn Anh	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.326103+00	ai-dev3@savameta.com
anhnh@savameta.com	Nguyễn Hải Anh	Đồ hoạ & Sáng tạo	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.327079+00	ai-dev3@savameta.com
kieuttl@savameta.com	Thái Thị Lê Kiều	Kinh doanh	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.328082+00	ai-dev3@savameta.com
hieudt@savameta.com	Đào Trung Hiếu	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.328955+00	ai-dev3@savameta.com
hungvt@savameta.com	Vũ Tuấn Hùng	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.329965+00	ai-dev3@savameta.com
datnq@savameta.com	Nghiêm Quốc Đạt	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.330911+00	ai-dev3@savameta.com
tungdx@savameta.com	Dương Xuân Tùng	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.332256+00	ai-dev3@savameta.com
kiennv@savameta.com	Nguyễn Văn Kiên	AI Lumi Tech	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.333407+00	ai-dev3@savameta.com
trongtb@savameta.com	Trần Bình Trọng	AI Lumi Tech	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.334577+00	ai-dev3@savameta.com
namdh@savameta.com	Dương Hồng Nam	AI Lumi Tech	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.335485+00	ai-dev3@savameta.com
andt@savameta.com	Đinh Tiến An	AI Lumi Tech	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.336653+00	ai-dev3@savameta.com
tamnt@savameta.com	Nguyễn Thị Tâm	AI Lumi Tech	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.33787+00	ai-dev3@savameta.com
thieunv@savameta.com	Nguyễn Văn Thiệu	AI Lumi Tech	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.338882+00	ai-dev3@savameta.com
khoitt@savameta.com	Trần Trọng Khôi	AI Lumi Tech	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.340086+00	ai-dev3@savameta.com
thuongdm@savameta.com	Đỗ Mạnh Thường	AI Lumi Tech	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.341311+00	ai-dev3@savameta.com
trangntk@savameta.com	Nguyễn Thị Kiều Trang	Kinh doanh	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.342417+00	ai-dev3@savameta.com
haihd@savameta.com	Hoàng Đức Hải	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.34339+00	ai-dev3@savameta.com
trungnt@savameta.com	Nguyễn Thành Trung	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.344575+00	ai-dev3@savameta.com
tuanph@savameta.com	Phạm Huy Tuấn	Đồ hoạ & Sáng tạo	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.345905+00	ai-dev3@savameta.com
vupa@savameta.com	Phan Anh Vũ	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.346821+00	ai-dev3@savameta.com
hoangv@savameta.com	Vũ Hoàng	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.348346+00	ai-dev3@savameta.com
thangam@savameta.com	An Minh Thắng	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.349811+00	ai-dev3@savameta.com
ducln@savameta.com	Lương Ngọc Đức	Kinh doanh	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.351049+00	ai-dev3@savameta.com
giangnt@savameta.com	Nguyễn Thanh Giang	Kinh doanh	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.352063+00	ai-dev3@savameta.com
hungnt@savameta.com	Nguyễn Tuấn Hùng	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.35313+00	ai-dev3@savameta.com
tungnv@savameta.com	Nguyễn Văn Tùng	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.354053+00	ai-dev3@savameta.com
trungpd@savameta.com	Phạm Đức Trung	Kinh doanh	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.355042+00	ai-dev3@savameta.com
linhpt@savameta.com	Phạm Thùy Linh	AI Lumi Tech	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.357655+00	ai-dev3@savameta.com
luongdd@savameta.com	Dương Đức Lương	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.359012+00	ai-dev3@savameta.com
trinhhtk@savameta.com	Hà Thị Kiều Trinh	Nhân sự - Văn hóa	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.360119+00	ai-dev3@savameta.com
giangvtm@savameta.com	Vũ Trần Minh Giang	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.36121+00	ai-dev3@savameta.com
linhnh@savameta.com	Nguyễn Hoài Linh	Nhân sự - Văn hóa	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.363194+00	ai-dev3@savameta.com
thuta@savameta.com	Tăng Anh Thư	Kinh doanh	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.364169+00	ai-dev3@savameta.com
sonhh@savameta.com	Hà Hồng Sơn	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.365621+00	ai-dev3@savameta.com
bannd@savameta.com	Nguyễn Đức Ban	AI Lumi Tech	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.366961+00	ai-dev3@savameta.com
trangltm@savameta.com	Lê Thị Mai Trang	Tài chính - Kế toán	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.368286+00	ai-dev3@savameta.com
namvv@savameta.com	Vũ Văn Nam	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.369457+00	ai-dev3@savameta.com
hungnv1@savameta.com	Nguyễn Văn Hưng	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.370614+00	ai-dev3@savameta.com
longtt@savameta.com	Trần Tuấn Long	Nhân sự - Văn hóa	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.371635+00	ai-dev3@savameta.com
hieuhm@savameta.com	Huỳnh Minh Hiếu	Kinh doanh	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.372831+00	ai-dev3@savameta.com
hoangpc@savameta.com	Phan Công Hoàng	Kinh doanh	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.374242+00	ai-dev3@savameta.com
hungtq@savameta.com	Trần Quang Hưng	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.376585+00	ai-dev3@savameta.com
thanhtq@savameta.com	Tạ Quang Thành	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.377768+00	ai-dev3@savameta.com
huynt@savameta.com	Nguyễn Trường Huy	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.378918+00	ai-dev3@savameta.com
chinhpp@savameta.com	Phạm Phương Chinh	Tài chính - Kế toán	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.380085+00	ai-dev3@savameta.com
dailq@savameta.com	Lê Quang Đại	Kinh doanh	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.381391+00	ai-dev3@savameta.com
dungkt@savameta.com	Khuất Tuấn Dũng	BizEx & QA	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.383105+00	ai-dev3@savameta.com
trieudth@savameta.com	Đỗ Thị Hải Triều	Kinh doanh	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.38461+00	ai-dev3@savameta.com
namnd@savameta.com	Ngô Đức Nam	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.385744+00	ai-dev3@savameta.com
cuongkh@savameta.com	Kiều Hùng Cương	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.387119+00	ai-dev3@savameta.com
quynb@savameta.com	Nguyễn Bá Quý	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.388089+00	ai-dev3@savameta.com
tungdt@savameta.com	Đào Thanh Tùng	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.388997+00	ai-dev3@savameta.com
baonq@savameta.com	Nguyễn Quốc Bảo	AI Lumi Tech	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.390045+00	ai-dev3@savameta.com
phuocnn@savameta.com	Nguyễn Như Phước	Metaverse	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.391467+00	ai-dev3@savameta.com
datnt@savameta.com	Nguyễn Tiến Đạt	Sava Studio	savameta-hr-xlsx-2026-05-26	2026-05-26 07:42:31.392717+00	ai-dev3@savameta.com
\.


--
-- Data for Name: history_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.history_entries (id, "userId", "sessionId", model, "promptTokens", "completionTokens", "totalTokens", "totalCostUsd", "createdAt", cache_read_tokens) FROM stdin;
cmpm9tluc00019mrfjudtl9ki	\N	c7377050-5f79-40a6-9fb3-c6df4b91b99b-49	openai/gpt-4o	1014	125	1139	0.003785	2026-05-26T06:45:22.260Z	0
cmpm9thnb000382cjdy89xsbq	42	c7377050-5f79-40a6-9fb3-c6df4b91b99b-49	z-ai/glm-5.1	9925	40	9965	0	2026-05-26T06:45:16.823Z	0
cmpm9qwfy0001ao0056p6tgnl	\N	c7377050-5f79-40a6-9fb3-c6df4b91b99b-49	openai/gpt-4o	1017	145	1162	0.0039925	2026-05-26T06:43:16.030Z	0
cmpm9qr32000182cjzue43la0	42	c7377050-5f79-40a6-9fb3-c6df4b91b99b-49	z-ai/glm-5.1	9906	39	9945	0	2026-05-26T06:43:09.086Z	0
cmpm9mh0t0001yest0uo30l9p	42	c7377050-5f79-40a6-9fb3-c6df4b91b99b-49	z-ai/glm-5.1	9890	50	9940	0	2026-05-26T06:39:49.421Z	0
cmpm9mbwq0001awq9m234agnu	\N	bf06ceb6-84b2-4934-983f-021551b79354-49	openai/gpt-4o	1130	143	1273	0.004255	2026-05-26T06:39:42.794Z	0
cmpm9m7bm00039cta00s1sg1e	42	bf06ceb6-84b2-4934-983f-021551b79354-49	z-ai/glm-5.1	10026	56	10082	0	2026-05-26T06:39:36.850Z	0
cmpm9m2ly00019ctavkelpyzw	42	bf06ceb6-84b2-4934-983f-021551b79354-49	z-ai/glm-5.1	9890	163	10053	0	2026-05-26T06:39:30.742Z	0
cmpm981vb000390dxtrdyek19	29	722f6041-ed29-41d5-8b52-ca7cb270a3e1-36	z-ai/glm-5.1	9105	85	9190	0	2026-05-26T06:28:36.599Z	0
cmpm97p8d000190dx7aadeiug	29	722f6041-ed29-41d5-8b52-ca7cb270a3e1-36	z-ai/glm-5.1	9068	73	9141	0	2026-05-26T06:28:20.221Z	0
cmpm97cqf000186yfwsytzmy3	29	ff21fef8-6f9f-4e7a-9ec6-5011c4512971-36	z-ai/glm-5.1	9067	50	9117	0	2026-05-26T06:28:04.023Z	0
cmpm96r730001fzh3pc8mx514	29	6077e9dc-2d68-4cf2-9cd9-bcf904c3b3c6-36	z-ai/glm-5.1	9067	61	9128	0	2026-05-26T06:27:36.111Z	0
cmpm8i03l0001kde9wpy35r2k	51	352566a1-7ee7-4a23-9d14-8c8e09e95f6d-60	z-ai/glm-5.1	9050	59	9109	0	2026-05-26T06:08:21.249Z	0
cmpm5lvyw00011rktsgwjd2bn	24	9c6a5d72-0603-406f-86ee-540cf672f63a-31	z-ai/glm-5.1	11594	695	12289	0	2026-05-26T04:47:23.672Z	0
cmpm58j5z0001fp9pp4cbqu0z	\N	f43d5a07-8da4-4b98-aa4e-b289fc8554de-25	openai/gpt-4o	6717	159	6876	0.0183825	2026-05-26T04:37:00.551Z	0
cmpm5551s0001xthfn2i4er3r	24	ca54fb60-38a1-4c68-b53d-e76cff90b52c-31	z-ai/glm-5.1	17319	1825	19144	0	2026-05-26T04:34:22.288Z	0
cmpm52asb000111gw4vfsdm9a	179	36cffb68-4aa2-442c-b2f3-fe1c0ec87655-189	z-ai/glm-5.1	10373	693	11066	0	2026-05-26T04:32:09.755Z	0
cmpm4m9gw000110b9s4180y4m	21	011131b4-bc60-4577-9f81-c612113a3246-26	z-ai/glm-5.1	9048	73	9121	0	2026-05-26T04:19:41.552Z	0
cmpm4c9gm0001130f15p0utcz	20	b0d63d3d-edb0-4856-9f9c-7e8f81d43fc8-25	z-ai/glm-5.1	15944	5853	21797	0	2026-05-26T04:11:54.982Z	0
cmpm48zfr00018uj75vlpzwax	\N	5a24d05a-6d60-466c-8a82-3353efd22502-36	openai/gpt-4o	1061	159	1220	0.004242500000000001	2026-05-26T04:09:22.023Z	0
cmpm48ty20003sueewobd7doa	29	5a24d05a-6d60-466c-8a82-3353efd22502-36	z-ai/glm-5.1	10246	175	10421	0	2026-05-26T04:09:14.906Z	0
cmpm47yck0001sueerhovq4gy	29	5a24d05a-6d60-466c-8a82-3353efd22502-36	z-ai/glm-5.1	10379	86	10465	0	2026-05-26T04:08:33.956Z	0
cmpm3zf8h00016epbjlvhwq73	\N	f43d5a07-8da4-4b98-aa4e-b289fc8554de-25	openai/gpt-4o	4492	156	4648	0.01279	2026-05-26T04:01:55.937Z	0
cmpm3zai50005axmz6827iduu	20	f43d5a07-8da4-4b98-aa4e-b289fc8554de-25	z-ai/glm-5.1	13046	2499	15545	0	2026-05-26T04:01:49.805Z	0
cmpm3xf5v0001n3m5k7uzxgsq	\N	f43d5a07-8da4-4b98-aa4e-b289fc8554de-25	openai/gpt-4o	1287	146	1433	0.0046775	2026-05-26T04:00:22.531Z	0
cmpm3x9da0003axmzcp73tc9y	20	f43d5a07-8da4-4b98-aa4e-b289fc8554de-25	z-ai/glm-5.1	11950	435	12385	0	2026-05-26T04:00:15.022Z	0
cmpm3tvnu0001axmzg3tai27i	20	f43d5a07-8da4-4b98-aa4e-b289fc8554de-25	z-ai/glm-5.1	10766	391	11157	0	2026-05-26T03:57:37.290Z	0
cmpm3saxt0001ff872gwc4mma	\N	74ec7a2f-c577-4088-b842-43bf6c730f60-36	openai/gpt-4o	1263	152	1415	0.0046775	2026-05-26T03:56:23.777Z	0
cmpm3s6lc00057lz6zomt2fna	29	74ec7a2f-c577-4088-b842-43bf6c730f60-36	z-ai/glm-5.1	29635	1517	31152	0	2026-05-26T03:56:18.144Z	0
cmpm3pvjd0001atfk5fgjbmtb	20	0c895c67-7018-47ee-8d59-96210963db68-25	z-ai/glm-5.1	10513	424	10937	0	2026-05-26T03:54:30.505Z	0
cmpm3nvjv00037lz61l0egqgq	29	74ec7a2f-c577-4088-b842-43bf6c730f60-36	z-ai/glm-5.1	20255	689	20944	0	2026-05-26T03:52:57.211Z	0
cmpm3enw100017lz66yhpxdsp	29	74ec7a2f-c577-4088-b842-43bf6c730f60-36	z-ai/glm-5.1	14445	2979	17424	0	2026-05-26T03:45:47.377Z	0
cmpm398mz0001g03y8fniu6zq	47	1c972952-2e57-4f79-86fd-a2843adcbb46-56	z-ai/glm-5.1	9398	138	9536	0	2026-05-26T03:41:34.331Z	0
cmpm38dxi00011va6u80loxcg	\N	b4c6e71b-4b30-42d8-9da1-ab1fa04f15c7-56	openai/gpt-4o	1041	120	1161	0.0038025	2026-05-26T03:40:54.534Z	0
cmpm389ge0003ku40hifz2kf3	47	b4c6e71b-4b30-42d8-9da1-ab1fa04f15c7-56	z-ai/glm-5.1	9440	38	9478	0	2026-05-26T03:40:48.734Z	0
cmpm37ydw0001ku40stt28c3w	47	b4c6e71b-4b30-42d8-9da1-ab1fa04f15c7-56	z-ai/glm-5.1	9394	89	9483	0	2026-05-26T03:40:34.388Z	0
cmpm37mfg0001bk23d0wsb8j1	47	42e38950-70da-4a9a-87a9-a1c05267940d-56	z-ai/glm-5.1	9393	112	9505	0	2026-05-26T03:40:18.892Z	0
cmpm343qw00015y1fvo4ex72r	47	94b3833f-53f3-479b-afa8-88434d852f19-56	z-ai/glm-5.1	9393	100	9493	0	2026-05-26T03:37:34.712Z	0
cmpm31wz60001xron04y28p7u	\N	61c0b5c4-2681-4251-b00f-c10900cf55b6-56	openai/gpt-4o	1104	132	1236	0.00408	2026-05-26T03:35:52.626Z	0
cmpmbbchd0003w3sk64f9lre7	29	6d8d1680-07f4-4d22-81e6-d8f46b858149-36	z-ai/glm-5.1	17075	2844	19919	0	2026-05-26T07:27:09.553Z	0
cmpmb8rst0001w3skrwp1zxhz	29	6d8d1680-07f4-4d22-81e6-d8f46b858149-36	z-ai/glm-5.1	9880	73	9953	0	2026-05-26T07:25:09.437Z	0
cmpm9y4mu00013lnsw5nhwx4q	\N	c7377050-5f79-40a6-9fb3-c6df4b91b99b-49	openai/gpt-4o	1017	164	1181	0.0041825	2026-05-26T06:48:53.238Z	0
cmpm9xyw600036he2lybvbpnf	42	c7377050-5f79-40a6-9fb3-c6df4b91b99b-49	z-ai/glm-5.1	9964	56	10020	0	2026-05-26T06:48:45.798Z	0
cmpm9u1to0001hs0d6lvz5usd	\N	c7377050-5f79-40a6-9fb3-c6df4b91b99b-49	openai/gpt-4o	1019	126	1145	0.0038075	2026-05-26T06:45:42.972Z	0
cmpm9tw0600016he25yhppypy	42	c7377050-5f79-40a6-9fb3-c6df4b91b99b-49	z-ai/glm-5.1	9945	44	9989	0	2026-05-26T06:45:35.430Z	0
cmplsx7fd0001b9xrfuawoceu	51	f8ee22d1-963d-4465-82e4-a09f82f4e34d-60	z-ai/glm-5-turbo	8912	266	9178	0.0117584	2026-05-25T22:52:16.729Z	0
cmplae6gk0001vshvs79zvkvf	\N	fc7457bb-9bc2-41b3-abf7-cc583b9d8ee2-189	openai/gpt-4o	3327	172	3499	0.0100375	2026-05-25T14:13:35.924Z	0
cmplady450001bhh8uxd6e0f2	179	fc7457bb-9bc2-41b3-abf7-cc583b9d8ee2-189	z-ai/glm-5-turbo	13104	234	13338	0.0166608	2026-05-25T14:13:25.109Z	0
cmpl3w4vr0003k2rnqlk676n6	\N	fc7457bb-9bc2-41b3-abf7-cc583b9d8ee2-189	openai/gpt-4o	2100	147	2247	0.00672	2026-05-25T11:11:36.375Z	0
cmpl3w12a0003tyjzj8uo99qy	179	fc7457bb-9bc2-41b3-abf7-cc583b9d8ee2-189	z-ai/glm-5-turbo	10701	2527	13228	0.0229492	2026-05-25T11:11:31.426Z	0
cmpl3ul6f0001tyjzdupz5t5h	179	fc7457bb-9bc2-41b3-abf7-cc583b9d8ee2-189	z-ai/glm-5-turbo	9663	1224	10887	0.0164916	2026-05-25T11:10:24.183Z	0
cmpl3dacc0001bxoy7ze5l7nh	\N	561c3462-97a6-4628-9d2d-f36d1c11254b-25	openai/gpt-4o	2219	166	2385	0.0072075	2026-05-25T10:56:56.988Z	0
cmpl3d33b0007mnmvxipg3sj5	20	561c3462-97a6-4628-9d2d-f36d1c11254b-25	z-ai/glm-5-turbo	15977	191	16168	0.0199364	2026-05-25T10:56:47.591Z	0
cmpl28qtq000321m5uco408ce	43	b0c30767-cf92-4982-bbdd-9eb0392f9141-50	z-ai/glm-5-turbo	8686	151	8837	0.0110272	2026-05-25T10:25:25.454Z	0
cmpl28ezo000121m5jwfe9860	43	b0c30767-cf92-4982-bbdd-9eb0392f9141-50	z-ai/glm-5-turbo	8542	162	8704	0.0108984	2026-05-25T10:25:10.116Z	0
cmpl20h3400014dx69hx8mipv	8	e50f75fb-1971-4bcf-bdd5-fe1ea4250f2d-11	z-ai/glm-5-turbo	9055	351	9406	0.01227	2026-05-25T10:18:59.584Z	0
cmpl1z38r0001f38u5zodkhwp	\N	ab8a1a48-d449-4222-b6b7-008d11f9421f-11	openai/gpt-4o	1096	113	1209	0.00387	2026-05-25T10:17:54.987Z	0
cmpl1yyro00072q9jsz04mebx	8	ab8a1a48-d449-4222-b6b7-008d11f9421f-11	z-ai/glm-5-turbo	14167	125	14292	0.0175004	2026-05-25T10:17:49.188Z	0
cmpl1qcts0001lc13f1dpkh11	\N	ab8a1a48-d449-4222-b6b7-008d11f9421f-11	openai/gpt-4o	1926	160	2086	0.006415000000000001	2026-05-25T10:11:07.504Z	0
cmpl1q7ei00052q9j67rhzwjp	8	ab8a1a48-d449-4222-b6b7-008d11f9421f-11	z-ai/glm-5-turbo	11788	64	11852	0.0144016	2026-05-25T10:11:00.474Z	0
cmpl1oeq600032q9j4y8pg763	8	ab8a1a48-d449-4222-b6b7-008d11f9421f-11	z-ai/glm-5-turbo	8325	873	9198	0.013482	2026-05-25T10:09:36.654Z	0
cmpl1lrg500012q9j90dmgm9w	8	ab8a1a48-d449-4222-b6b7-008d11f9421f-11	z-ai/glm-5-turbo	7677	684	8361	0.0119484	2026-05-25T10:07:33.173Z	0
cmpl1ejbe0001xzxbf4icpsq2	\N	a1b0c98e-5cde-4a73-94a9-2029a17ddaab-11	openai/gpt-4o	1164	155	1319	0.00446	2026-05-25T10:01:56.042Z	0
cmpl1ecbi000358mca71dcyg2	8	a1b0c98e-5cde-4a73-94a9-2029a17ddaab-11	z-ai/glm-5-turbo	8737	554	9291	0.0127004	2026-05-25T10:01:46.974Z	0
cmpl19bum000158mc1sy4fxoa	8	a1b0c98e-5cde-4a73-94a9-2029a17ddaab-11	z-ai/glm-5-turbo	7735	755	8490	0.012302	2026-05-25T09:57:53.086Z	0
cmpl0zetx0001k2rnradq0j51	\N	561c3462-97a6-4628-9d2d-f36d1c11254b-25	openai/gpt-4o	1378	174	1552	0.005185	2026-05-25T09:50:10.389Z	0
cmpl0z9jq0005mnmv8goaysl5	20	561c3462-97a6-4628-9d2d-f36d1c11254b-25	z-ai/glm-5-turbo	9854	1544	11398	0.0180008	2026-05-25T09:50:03.542Z	0
cmpl0wu9m00011hm5i2k6ib4l	\N	561c3462-97a6-4628-9d2d-f36d1c11254b-25	openai/gpt-4o	1161	154	1315	0.0044425	2026-05-25T09:48:10.426Z	0
cmpl0wpy10003mnmvjhw8b6y1	20	561c3462-97a6-4628-9d2d-f36d1c11254b-25	z-ai/glm-5-turbo	8796	754	9550	0.0135712	2026-05-25T09:48:04.825Z	0
cmpl0vm8j0001mnmv4j8jmso7	20	561c3462-97a6-4628-9d2d-f36d1c11254b-25	z-ai/glm-5-turbo	7702	918	8620	0.0129144	2026-05-25T09:47:13.363Z	0
cmpkykqhz0001o9gje8i4r74i	15	3970d16d-bd9c-444f-b5d1-bf531db3b08a-19	z-ai/glm-5-turbo	9404	796	10200	0.0144688	2026-05-25T08:42:46.439Z	0
cmpkyj1nn00011429ga5zkjc9	\N	3d06422b-4f90-4bc1-a229-fafa2c95e364-25	openai/gpt-4o	1693	169	1862	0.005922500000000001	2026-05-25T08:41:27.587Z	0
cmpkyitp400056dectat1rydw	20	3d06422b-4f90-4bc1-a229-fafa2c95e364-25	z-ai/glm-5-turbo	10484	253	10737	0.0135928	2026-05-25T08:41:17.272Z	0
cmpkyh7jn0001kod4oztvc6k8	1	951da00e-32c1-4c94-bb9e-783dd0d328e9-1	z-ai/glm-5-turbo	8339	153	8492	0.0106188	2026-05-25T08:40:01.907Z	0
cmpkyds6i0001d1d0r4m1njsx	1	4d5fdc5a-1659-4c01-bb8d-ca004ce9ae5d-1	z-ai/glm-5-turbo	7665	60	7725	0.009438	2026-05-25T08:37:22.026Z	0
cmpkyb35s00017dsshw94d3l1	\N	3d06422b-4f90-4bc1-a229-fafa2c95e364-25	openai/gpt-4o	1531	156	1687	0.0053875	2026-05-25T08:35:16.288Z	0
cmpkyavza00036decljrsvj95	20	3d06422b-4f90-4bc1-a229-fafa2c95e364-25	z-ai/glm-5-turbo	10039	961	11000	0.0158908	2026-05-25T08:35:06.982Z	0
cmpky9vwd00016decjddxveka	20	3d06422b-4f90-4bc1-a229-fafa2c95e364-25	z-ai/glm-5-turbo	8736	593	9329	0.0128552	2026-05-25T08:34:20.221Z	0
cmpkxmab20001oi8tub2e2l9y	\N	0b71d341-76b0-4e05-ae26-5bd5a3f8ffa5-25	openai/gpt-4o	1085	121	1206	0.003922500000000001	2026-05-25T08:15:59.150Z	0
cmpkxm2o90003og6sozx5080c	20	0b71d341-76b0-4e05-ae26-5bd5a3f8ffa5-25	z-ai/glm-5-turbo	9175	627	9802	0.013518	2026-05-25T08:15:49.257Z	0
cmpkxl3n6000113yl6ed7rl5f	2	e3a26750-9222-4369-a2ae-0924fcc909dd-2	z-ai/glm-5-turbo	7665	65	7730	0.009458	2026-05-25T08:15:03.858Z	0
cmpkxiwdw0001og6sdclzm0m0	20	0b71d341-76b0-4e05-ae26-5bd5a3f8ffa5-25	z-ai/glm-5-turbo	8687	171	8858	0.0111084	2026-05-25T08:13:21.140Z	0
cmpkxh19y0001wr0ay717deaz	\N	3dfc7fa5-4ca1-4b6c-9cfd-b4bd5eb11a81-25	openai/gpt-4o	1101	116	1217	0.0039125	2026-05-25T08:11:54.166Z	0
cmpkxgtqj0003hvxygmyqmbj2	20	3dfc7fa5-4ca1-4b6c-9cfd-b4bd5eb11a81-25	z-ai/glm-5-turbo	11740	76	11816	0.014392	2026-05-25T08:11:44.395Z	0
cmpm2zpy2000111z060lbtm3r	47	61c0b5c4-2681-4251-b00f-c10900cf55b6-56	z-ai/glm-5.1	9074	139	9213	0	2026-05-26T03:34:10.202Z	0
cmpm1wlta00017hxq8pdwulln	\N	ea57df6f-382b-4f25-b179-98c40a5f59db-32	openai/gpt-4o	1062	153	1215	0.004185	2026-05-26T03:03:45.262Z	0
cmpm1wf1i0005nkhoajw2fpr6	25	ea57df6f-382b-4f25-b179-98c40a5f59db-32	z-ai/glm-5-turbo	10962	60	11022	0.0133944	2026-05-26T03:03:36.486Z	0
cmpm1w5do0001upwcujp22pxx	\N	ea57df6f-382b-4f25-b179-98c40a5f59db-32	openai/gpt-4o	1136	128	1264	0.00412	2026-05-26T03:03:23.964Z	0
cmpm1vyfh0003nkhopu50ib1k	25	ea57df6f-382b-4f25-b179-98c40a5f59db-32	z-ai/glm-5-turbo	10529	184	10713	0.0133708	2026-05-26T03:03:14.957Z	0
cmpm1ov770001nkhozxhgyg43	25	ea57df6f-382b-4f25-b179-98c40a5f59db-32	z-ai/glm-5-turbo	9381	87	9468	0.0116052	2026-05-26T02:57:44.179Z	0
cmpkus12900013vow7cxpjozg	8	64a0f681-cd26-4352-90ce-e47aaa2827d6-11	z-ai/glm-5-turbo	7663	60	7723	0.0094356	2026-05-25T06:56:28.257Z	0
cmpkun2es000157jytny9pfot	47	df3abfc8-28e1-46c6-b0da-3f2576170d23-56	z-ai/glm-5-turbo	7689	184	7873	0.0099628	2026-05-25T06:52:36.724Z	0
cmpkrblfj0001r8rh91mkzir6	47	94434e92-f47a-4bf7-a90a-e6f208be737b-56	z-ai/glm-5-turbo	7762	389	8151	0.0108704	2026-05-25T05:19:42.655Z	0
cmpkoyioh0001g8hnd3rmwunh	\N	dd2cb9e2-6889-4ef1-8e04-212c2c3c6dcb-25	openai/gpt-4o	2954	161	3115	0.008995000000000001	2026-05-25T04:13:33.329Z	0
cmpkoy9v800015hdtoywaiab4	20	dd2cb9e2-6889-4ef1-8e04-212c2c3c6dcb-25	z-ai/glm-5-turbo	11061	1872	12933	0.0207612	2026-05-25T04:13:21.908Z	0
cmpkowevo0001xtmvgrkdc7xy	\N	dd2cb9e2-6889-4ef1-8e04-212c2c3c6dcb-25	openai/gpt-4o	2402	179	2581	0.007795000000000001	2026-05-25T04:11:55.092Z	0
cmpkow5vq0003di5ij3tbnha8	20	dd2cb9e2-6889-4ef1-8e04-212c2c3c6dcb-25	z-ai/glm-5-turbo	9096	1975	11071	0.0188152	2026-05-25T04:11:43.430Z	0
cmpkornpo0001di5ijmj1wkil	20	dd2cb9e2-6889-4ef1-8e04-212c2c3c6dcb-25	z-ai/glm-5-turbo	7711	2045	9756	0.0174332	2026-05-25T04:08:13.260Z	0
cmpkmwhxz00019tm3iwau0trl	20	68d7c9c8-e227-411c-a141-b1ac0b493d2a-25	z-ai/glm-5-turbo	7761	1094	8855	0.0136892	2026-05-25T03:15:59.831Z	0
cmpkmt70v00012hi4o9ynx53e	\N	50ff861a-2617-4cd3-93ed-65a9d4df2211-31	openai/gpt-4o	1190	147	1337	0.004445	2026-05-25T03:13:25.711Z	0
cmpkmsycb0003ddx4ym3bua50	24	50ff861a-2617-4cd3-93ed-65a9d4df2211-31	z-ai/glm-5-turbo	9476	1750	11226	0.0183712	2026-05-25T03:13:14.459Z	0
cmpkmrnnb0001ddx4hx69879x	24	50ff861a-2617-4cd3-93ed-65a9d4df2211-31	z-ai/glm-5-turbo	8905	561	9466	0.01293	2026-05-25T03:12:13.943Z	0
cmpkmqky000019c7dlyclyi35	\N	e24f50c0-0870-48ec-b39d-32fb2582103a-31	openai/gpt-4o	1148	174	1322	0.00461	2026-05-25T03:11:23.784Z	0
cmpkmqd490003u8muct29duvn	24	e24f50c0-0870-48ec-b39d-32fb2582103a-31	z-ai/glm-5-turbo	8450	717	9167	0.013008	2026-05-25T03:11:13.641Z	0
cmpkmpbfr0001u8muatblzze7	24	e24f50c0-0870-48ec-b39d-32fb2582103a-31	z-ai/glm-5-turbo	7760	669	8429	0.011988	2026-05-25T03:10:24.807Z	0
cmpkm77fb0003synsppr251hd	8	5683d607-4abe-428d-b42c-d5ced3b7fc95-11	z-ai/glm-5-turbo	8829	571	9400	0.0128788	2026-05-25T02:56:19.799Z	0
cmpkm5tay0001syns37nqj9ew	8	5683d607-4abe-428d-b42c-d5ced3b7fc95-11	z-ai/glm-5-turbo	7738	762	8500	0.0123336	2026-05-25T02:55:14.842Z	0
cmpkm50950001138icyc8g3ad	\N	579cddf7-c5a1-483f-a22b-e86c4142a95a-11	openai/gpt-4o	1089	111	1200	0.0038325	2026-05-25T02:54:37.193Z	0
cmpkm4s540009wjwf7086rocf	8	579cddf7-c5a1-483f-a22b-e86c4142a95a-11	z-ai/glm-5-turbo	12957	103	13060	0.0159604	2026-05-25T02:54:26.680Z	0
cmpkm3n050001w1f6zob87zpt	\N	579cddf7-c5a1-483f-a22b-e86c4142a95a-11	openai/gpt-4o	1325	149	1474	0.0048025	2026-05-25T02:53:33.365Z	0
cmpkm3frf0007wjwfclhoqi2a	8	579cddf7-c5a1-483f-a22b-e86c4142a95a-11	z-ai/glm-5-turbo	10674	42	10716	0.0129768	2026-05-25T02:53:23.979Z	0
cmpkm2kbn0001y31ngupoew3w	\N	579cddf7-c5a1-483f-a22b-e86c4142a95a-11	openai/gpt-4o	1485	136	1621	0.005072500000000001	2026-05-25T02:52:43.235Z	0
cmpkm2awl0005wjwfvxrpw4pc	8	579cddf7-c5a1-483f-a22b-e86c4142a95a-11	z-ai/glm-5-turbo	7812	342	8154	0.0107424	2026-05-25T02:52:31.029Z	0
cmpkm21p90001krk18cvvwchj	\N	579cddf7-c5a1-483f-a22b-e86c4142a95a-11	openai/gpt-4o	1094	129	1223	0.004025	2026-05-25T02:52:19.101Z	0
cmpkm1ud70003wjwfmd62q4ys	8	579cddf7-c5a1-483f-a22b-e86c4142a95a-11	z-ai/glm-5-turbo	7387	449	7836	0.0106604	2026-05-25T02:52:09.595Z	0
cmpkm1fjf0001wjwf4yaq4m7x	8	579cddf7-c5a1-483f-a22b-e86c4142a95a-11	z-ai/glm-5-turbo	6893	407	7300	0.0098996	2026-05-25T02:51:50.379Z	0
cmpkm1b0l000113xgoxivgqnb	\N	e9876909-41e4-4913-ad46-b1dec41dc2df-189	openai/gpt-4o	1113	135	1248	0.004132500000000001	2026-05-25T02:51:44.517Z	0
cmpkm12y80007120elnqlgfyu	179	e9876909-41e4-4913-ad46-b1dec41dc2df-189	z-ai/glm-5-turbo	17522	2164	19686	0.0296824	2026-05-25T02:51:34.064Z	0
cmpkm03in00014a51aslbkm5m	\N	e9876909-41e4-4913-ad46-b1dec41dc2df-189	openai/gpt-4o	1216	132	1348	0.00436	2026-05-25T02:50:48.143Z	0
cmpklzvvx0005120emwcj0vj3	179	e9876909-41e4-4913-ad46-b1dec41dc2df-189	z-ai/glm-5-turbo	9273	171	9444	0.0118116	2026-05-25T02:50:38.253Z	0
cmpklyysm0003qk8rthwximcb	\N	9159bd18-d3be-447f-8441-e611d5e1ef89-31	openai/gpt-4o	1127	148	1275	0.0042975	2026-05-25T02:49:55.366Z	0
cmpklyrmo00053rhbp913vusg	24	9159bd18-d3be-447f-8441-e611d5e1ef89-31	z-ai/glm-5-turbo	7748	3257	11005	0.0223256	2026-05-25T02:49:46.080Z	0
cmpklygr80001qk8rwik6469o	\N	e9876909-41e4-4913-ad46-b1dec41dc2df-189	openai/gpt-4o	1114	155	1269	0.004335	2026-05-25T02:49:31.988Z	0
cmpkly8zs0003120e2zei56jb	179	e9876909-41e4-4913-ad46-b1dec41dc2df-189	z-ai/glm-5-turbo	9463	262	9725	0.0124036	2026-05-25T02:49:21.928Z	0
cmpklxt070001jzgypkpkh7js	\N	9159bd18-d3be-447f-8441-e611d5e1ef89-31	openai/gpt-4o	1085	126	1211	0.0039725	2026-05-25T02:49:01.207Z	0
cmpklxqvb0001120er4ewmvmk	179	e9876909-41e4-4913-ad46-b1dec41dc2df-189	z-ai/glm-5-turbo	6915	642	7557	0.010866	2026-05-25T02:48:58.439Z	0
cmpklxl2p00033rhbw8rpz9aj	24	9159bd18-d3be-447f-8441-e611d5e1ef89-31	z-ai/glm-5-turbo	6998	509	7507	0.0104336	2026-05-25T02:48:50.929Z	0
cmpklwqta00013rhbuibb2an0	24	9159bd18-d3be-447f-8441-e611d5e1ef89-31	z-ai/glm-5-turbo	6918	407	7325	0.009929599999999998	2026-05-25T02:48:11.710Z	0
cmpklv69z0003aova28cfe32m	24	172db7cc-4707-4050-88cd-de3aa8a5095d-31	z-ai/glm-5-turbo	12594	1428	14022	0.0208248	2026-05-25T02:46:58.439Z	0
cmpkx82ut0001hvxynjpoon57	20	3dfc7fa5-4ca1-4b6c-9cfd-b4bd5eb11a81-25	z-ai/glm-5-turbo	11105	93	11198	0.013698	2026-05-25T08:04:56.309Z	0
cmpkuv34e00017tmyfe8115bi	\N	64a0f681-cd26-4352-90ce-e47aaa2827d6-11	openai/gpt-4o	1579	135	1714	0.0052975	2026-05-25T06:58:50.894Z	0
cmpkuuvlx00073vowyvl8aa6e	8	64a0f681-cd26-4352-90ce-e47aaa2827d6-11	z-ai/glm-5-turbo	11185	81	11266	0.013746	2026-05-25T06:58:41.157Z	0
cmpkuts6l0001gnvefwb1olsa	\N	64a0f681-cd26-4352-90ce-e47aaa2827d6-11	openai/gpt-4o	1143	138	1281	0.0042375	2026-05-25T06:57:50.061Z	0
cmpkuth6c00053vowsisqbddt	8	64a0f681-cd26-4352-90ce-e47aaa2827d6-11	z-ai/glm-5-turbo	8436	713	9149	0.0129752	2026-05-25T06:57:35.796Z	0
cmpkusi7x00033vowe5slzjk6	8	64a0f681-cd26-4352-90ce-e47aaa2827d6-11	z-ai/glm-5-turbo	7709	690	8399	0.0120108	2026-05-25T06:56:50.493Z	0
cmphxr4sn0001s6d0wceqm1lq	47	fd736563-c942-4047-a035-c84a2cb132eb-56	z-ai/glm-5-turbo	12947	677	13624	0.0182444	2026-05-23T05:56:26.759Z	0
cmphs8ow10001k0x67slf8ml3	20	3916bf63-16b4-4765-bcbb-171e249711a5-25	z-ai/glm-5-turbo	9611	1051	10662	0.0157372	2026-05-23T03:22:08.257Z	0
cmpgrlbkc000113w8k25rc0tc	\N	db0e096a-dd4a-4659-a940-7ccccd0ef48f-49	openai/gpt-4o	1139	135	1274	0.0041975	2026-05-22T10:16:11.724Z	0
cmpgrl3iu0003d1ejt2oxqjtv	42	db0e096a-dd4a-4659-a940-7ccccd0ef48f-49	z-ai/glm-5-turbo	15731	2109	17840	0.0273132	2026-05-22T10:16:01.302Z	0
cmpgriabn0001d1ejq9nir5h9	42	db0e096a-dd4a-4659-a940-7ccccd0ef48f-49	z-ai/glm-5-turbo	8577	500	9077	0.0122924	2026-05-22T10:13:50.147Z	0
cmpgrhc150001xznhqzdxvjee	42	da214c0c-822b-4c08-bacc-cd9d05206b91-49	z-ai/glm-5-turbo	6915	178	7093	0.00901	2026-05-22T10:13:05.705Z	0
cmpgq5tv00001n9as83e6n683	29	9b8177a0-d5fb-422b-89bc-1fb842f504dd-36	z-ai/glm-5-turbo	6921	2683	9604	0.0190372	2026-05-22T09:36:09.324Z	0
cmpgq3upf00011kvfcyenj1pm	29	c062bcf5-738e-4b53-a600-6cd52a2b45cf-36	z-ai/glm-5-turbo	6916	475	7391	0.0101992	2026-05-22T09:34:37.107Z	0
cmpgq3cap0001gqxmvetteck4	29	c984e531-58a9-4e8f-8bec-5074ccea8b38-36	z-ai/glm-5-turbo	6916	464	7380	0.0101552	2026-05-22T09:34:13.249Z	0
cmpgq2j9m0001lbf9pggbcg48	29	9522588c-703d-4852-88b1-8791ea2045aa-36	z-ai/glm-5-turbo	6916	490	7406	0.0102592	2026-05-22T09:33:35.626Z	0
cmpgo9b270001pgjw2xctdz73	24	40df9874-d09f-4a30-912f-f52cbbec8fc9-31	z-ai/glm-5-turbo	11378	2280	13658	0.0227736	2026-05-22T08:42:52.351Z	0
cmpgnt7r50001lpewdxuqwd5l	20	3dfc7fa5-4ca1-4b6c-9cfd-b4bd5eb11a81-25	z-ai/glm-5-turbo	7714	1142	8856	0.0138248	2026-05-22T08:30:21.569Z	0
cmpgnjc1b0001y0p6ri52io3h	\N	ea534dca-c03a-4a02-a6e4-af25f1d58b09-193	openai/gpt-4o	1143	145	1288	0.004307500000000001	2026-05-22T08:22:40.559Z	0
cmpgnj4bk0003vi51wq4kzv07	183	ea534dca-c03a-4a02-a6e4-af25f1d58b09-193	z-ai/glm-5-turbo	17214	2157	19371	0.0292848	2026-05-22T08:22:30.560Z	0
cmpgnh6uw0001vi5184jm0n4y	183	ea534dca-c03a-4a02-a6e4-af25f1d58b09-193	z-ai/glm-5-turbo	8530	723	9253	0.013128	2026-05-22T08:21:00.536Z	0
cmpgkk3ea0001807vvdput0f4	\N	383c5675-1249-4308-96f7-a4f9323135e7-25	openai/gpt-4o	2187	135	2322	0.006817500000000001	2026-05-22T06:59:17.170Z	0
cmpgkjut70005nz5nkgtu1nk5	20	383c5675-1249-4308-96f7-a4f9323135e7-25	z-ai/glm-5-turbo	15148	1443	16591	0.0239496	2026-05-22T06:59:06.043Z	0
cmpgkh8io000112ncqdwuq0g6	\N	383c5675-1249-4308-96f7-a4f9323135e7-25	openai/gpt-4o	2266	122	2388	0.006885	2026-05-22T06:57:03.840Z	0
cmpgkh0pn0003nz5nelcni7cs	20	383c5675-1249-4308-96f7-a4f9323135e7-25	z-ai/glm-5-turbo	13973	1252	15225	0.0217756	2026-05-22T06:56:53.723Z	0
cmpgkccj70001owyysrtwgxfn	183	e851b985-c6e7-432b-82ac-c05167125933-193	z-ai/glm-5-turbo	6906	597	7503	0.0106752	2026-05-22T06:53:15.763Z	0
cmpgk2vae0001nz5n7pglm6k1	20	383c5675-1249-4308-96f7-a4f9323135e7-25	z-ai/glm-5-turbo	12844	1229	14073	0.0203288	2026-05-22T06:45:53.510Z	0
cmpgjzkl800013kehwfrzjakj	183	3158a3a8-9920-4e3c-88d6-bca5e6cc1276-193	z-ai/glm-5-turbo	6911	594	7505	0.0106692	2026-05-22T06:43:19.676Z	0
cmpgjms920001pb0hfnioal2o	\N	a570c21f-b774-40a9-83c7-f76002ff20dd-193	openai/gpt-4o	1138	154	1292	0.004385	2026-05-22T06:33:23.078Z	0
cmpgjmjiz0003bg6z13kptmup	183	a570c21f-b774-40a9-83c7-f76002ff20dd-193	z-ai/glm-5-turbo	10186	516	10702	0.0142872	2026-05-22T06:33:11.771Z	0
cmpgjkq960001bg6zt5iiqcfk	183	a570c21f-b774-40a9-83c7-f76002ff20dd-193	z-ai/glm-5-turbo	6917	712	7629	0.0111484	2026-05-22T06:31:47.178Z	0
cmpghnchn0002110j1q83anrt	182	181bf83b-3f9e-45c2-bb68-7a1abec84163	z-ai/glm-5-turbo	6833	543	7376	0.0103716	2026-05-22T05:37:50.075Z	0
cmpgbbrjx0001pvusk35jhsqd	31	6d567f67-c026-4e01-be36-4fa7afa93875-38	z-ai/glm-5-turbo	6914	56	6970	0.0085208	2026-05-22T02:40:52.029Z	0
cmpf6wr5s0001qqvqd1xbebjf	20	2c209650-8250-43de-877b-26698d632789-25	z-ai/glm-5-turbo	6908	195	7103	0.009069599999999999	2026-05-21T07:49:27.040Z	0
cmpf5x5sf0001b1oi1kf0q0uw	\N	b541b73e-be57-47f6-b97a-52b73d229cc5-189	openai/gpt-4o	1050	119	1169	0.003815	2026-05-21T07:21:46.383Z	0
cmpf5wxz70001jn2k5ddyqprz	179	b541b73e-be57-47f6-b97a-52b73d229cc5-189	z-ai/glm-5-turbo	10763	73	10836	0.0132076	2026-05-21T07:21:36.259Z	0
cmpf3hpz80002gn15syos1lpd	181	ddcb1adf-ddcc-4eaf-96be-398be50ed462	z-ai/glm-5-turbo	5961	803	6764	0.0103652	2026-05-21T06:13:46.820Z	0
cmpf0p7df0001sf9txweprdp4	179	b541b73e-be57-47f6-b97a-52b73d229cc5-189	z-ai/glm-5-turbo	8787	60	8847	0.0107844	2026-05-21T04:55:37.107Z	0
cmpdr0ifw0001101p5uu8z4po	20	b64311c0-b138-4847-af62-b6494b7dda70-25	z-ai/glm-5-turbo	7788	389	8177	0.0109016	2026-05-20T07:36:42.332Z	0
cmpdquqa80001lo317tab83y1	20	18829889-fac1-4778-b229-9cd3b6a93980-25	z-ai/glm-5-turbo	6897	327	7224	0.0095844	2026-05-20T07:32:12.560Z	0
cmpdqchod0001xvnyzdtjdfpd	20	76c799ef-1015-455a-ad3c-dc3caf5985a2-25	z-ai/glm-5-turbo	9991	330	10321	0.0133092	2026-05-20T07:18:01.597Z	0
cmpdojpz8000146f2ukessn7l	20	3659deaf-940f-42ff-b259-b65edb77ab6b-25	z-ai/glm-5-turbo	8368	362	8730	0.0114896	2026-05-20T06:27:39.716Z	0
cmpdoikqz0001wzdkyroilyp5	\N	ff3c8285-e2d9-4f6c-ab9c-7c07a6e94120-25	openai/gpt-4o	1915	181	2096	0.0065975	2026-05-20T06:26:46.283Z	0
cmpdoi60d000311xcz92qi47v	20	ff3c8285-e2d9-4f6c-ab9c-7c07a6e94120-25	z-ai/glm-5-turbo	18596	743	19339	0.0252872	2026-05-20T06:26:27.181Z	0
cmpkjuvv50001ej1jnhujdflm	188	d1395131-09e9-4638-a0d0-db19b56331fb-198	z-ai/glm-5-turbo	6849	58	6907	0.0084508	2026-05-25T01:50:45.713Z	0
cmpiawf1t0001tlbaea2iclw0	\N	f72e4d57-a503-492b-b667-d1a428ef3b7b-63	openai/gpt-4o	1131	153	1284	0.0043575	2026-05-23T12:04:28.337Z	0
cmpiaw71j0005kn3c6vnsg7qc	54	f72e4d57-a503-492b-b667-d1a428ef3b7b-63	z-ai/glm-5-turbo	8797	553	9350	0.0127684	2026-05-23T12:04:17.959Z	0
cmpiacgjt00017h0qd64le46h	\N	f72e4d57-a503-492b-b667-d1a428ef3b7b-63	openai/gpt-4o	1281	152	1433	0.0047225	2026-05-23T11:48:57.161Z	0
cmpiac8kr0003kn3cp2edmgsz	54	f72e4d57-a503-492b-b667-d1a428ef3b7b-63	z-ai/glm-5-turbo	7602	135	7737	0.0096624	2026-05-23T11:48:46.827Z	0
cmpiabp5s0001kn3cnnz4ldqc	54	f72e4d57-a503-492b-b667-d1a428ef3b7b-63	z-ai/glm-5-turbo	7223	309	7532	0.009903599999999999	2026-05-23T11:48:21.664Z	0
cmpc4cy5c0001zpw7haulbprc	26	1834bf89-6107-498b-9e96-ca2862c56fb6-33	z-ai/glm-5-turbo	6248	142	6390	0.0080656	2026-05-19T04:14:45.216Z	0
cmpc38la60001hbhsj44s7ztv	179	8ef15987-8387-4978-8fca-bcc22adc2d44-189	z-ai/glm-5-turbo	7068	497	7565	0.0104696	2026-05-19T03:43:22.302Z	0
cmpc1nszv0001iq72agb4nyxk	\N	106ede08-722a-4da4-b24f-e2d81ab6f687-36	openai/gpt-4o	1248	157	1405	0.004690000000000001	2026-05-19T02:59:12.907Z	0
cmpc1nj3u0005nrl0ck3onaup	29	106ede08-722a-4da4-b24f-e2d81ab6f687-36	z-ai/glm-5-turbo	15948	1331	17279	0.0244616	2026-05-19T02:59:00.090Z	0
cmpc1k5ig0003nrl0wnq1rmyy	29	106ede08-722a-4da4-b24f-e2d81ab6f687-36	z-ai/glm-5-turbo	12831	656	13487	0.0180212	2026-05-19T02:56:22.504Z	0
cmpc1i8vv0001nrl05it9d7w0	29	106ede08-722a-4da4-b24f-e2d81ab6f687-36	z-ai/glm-5-turbo	8986	681	9667	0.0135072	2026-05-19T02:54:53.563Z	0
cmpc1fggz000145xjma6wrkxj	29	33ae72a3-a5ab-47a1-8ae5-507b57dd655e-36	z-ai/glm-5-turbo	9807	614	10421	0.0142244	2026-05-19T02:52:43.427Z	0
cmpc0aryj0003zk6qgs92u2t9	179	2432e88a-b056-4e7b-85f2-98d5970930f8-189	z-ai/glm-5-turbo	17761	2497	20258	0.0313012	2026-05-19T02:21:05.419Z	0
cmpc03keq0001zk6qqpay9cug	179	2432e88a-b056-4e7b-85f2-98d5970930f8-189	z-ai/glm-5-turbo	7696	479	8175	0.0111512	2026-05-19T02:15:29.042Z	0
cmpc00ggq000111k8jnwpoc1a	179	b15600b5-4937-4bc5-9e48-8899a222574a-189	z-ai/glm-5-turbo	7697	515	8212	0.0112964	2026-05-19T02:13:03.962Z	0
cmpaumws50001qfjbphjovxf7	179	2b4c1fdc-fbfc-40db-96b7-4357b7d85d88-189	z-ai/glm-5-turbo	11477	2059	13536	0.0220084	2026-05-18T06:54:47.669Z	0
cmpaitkkh0001pm953yzhlrk4	43	a39f6fea-4f30-4134-a524-5a69cb312200-50	z-ai/glm-5-turbo	6044	180	6224	0.007972799999999999	2026-05-18T01:24:03.041Z	0
cmp8e7ygo0001yjuwpgdw98dr	\N	89affd44-d1d4-46e0-b3fe-e2d5032ac9b4-25	openai/gpt-4o	1093	152	1245	0.0042525	2026-05-16T13:39:43.800Z	0
cmp8e7q3q000323ybmqf40g1f	20	89affd44-d1d4-46e0-b3fe-e2d5032ac9b4-25	z-ai/glm-5-turbo	5334	719	6053	0.0092768	2026-05-16T13:39:32.966Z	0
cmp8e6a0t000123yb23ixpqnj	20	89affd44-d1d4-46e0-b3fe-e2d5032ac9b4-25	z-ai/glm-5-turbo	4733	151	4884	0.0062836	2026-05-16T13:38:25.469Z	0
cmp82vxdj000b63qsomy5eu82	20	5ba1229c-968d-4132-932d-126973220458-25	z-ai/glm-5-turbo	6980	490	7470	0.010336	2026-05-16T08:22:26.743Z	0
cmp82v2e10001c7g755in7cuv	\N	5ba1229c-968d-4132-932d-126973220458-25	openai/gpt-4o	1841	159	2000	0.006192500000000001	2026-05-16T08:21:46.585Z	0
cmp82uuaw000963qsr98xd3s0	20	5ba1229c-968d-4132-932d-126973220458-25	z-ai/glm-5-turbo	6607	401	7008	0.0095324	2026-05-16T08:21:36.104Z	0
cmp82u5lh00014ksd0eixiclr	\N	5ba1229c-968d-4132-932d-126973220458-25	openai/gpt-4o	1633	142	1775	0.0055025	2026-05-16T08:21:04.085Z	0
cmp82txlj000763qs17a7qo1y	20	5ba1229c-968d-4132-932d-126973220458-25	z-ai/glm-5-turbo	5789	903	6692	0.0105588	2026-05-16T08:20:53.719Z	0
cmp82nblk0001xobuktst2vlt	\N	5ba1229c-968d-4132-932d-126973220458-25	openai/gpt-4o	1430	153	1583	0.005105	2026-05-16T08:15:45.272Z	0
cmp82n01j000563qsilfyna4a	20	5ba1229c-968d-4132-932d-126973220458-25	z-ai/glm-5-turbo	5172	656	5828	0.0088304	2026-05-16T08:15:30.295Z	0
cmp82lo0z000363qs6psn2old	20	5ba1229c-968d-4132-932d-126973220458-25	z-ai/glm-5-turbo	4759	453	5212	0.0075228	2026-05-16T08:14:28.067Z	0
cmp82ddtd000163qs223zjnli	20	5ba1229c-968d-4132-932d-126973220458-25	z-ai/glm-5-turbo	4726	49	4775	0.005867199999999999	2026-05-16T08:08:01.585Z	0
cmp3y0mae000114p8ch0om3ym	\N	159554ef-c577-47a0-915b-48013c3c4b16-25	openai/gpt-4o	1476	129	1605	0.00498	2026-05-13T10:55:02.870Z	0
cmp3y0erz0005sedzz3gvjicq	20	159554ef-c577-47a0-915b-48013c3c4b16-25	z-ai/glm-5-turbo	11625	1095	12720	0.01833	2026-05-13T10:54:53.135Z	0
cmp3xz9yk0001jnrb68snfb5m	\N	159554ef-c577-47a0-915b-48013c3c4b16-25	openai/gpt-4o	1190	153	1343	0.004505	2026-05-13T10:54:00.236Z	0
cmp3xz1kd0003sedzcyybxr2f	20	159554ef-c577-47a0-915b-48013c3c4b16-25	z-ai/glm-5-turbo	5348	525	5873	0.0085176	2026-05-13T10:53:49.357Z	0
cmp3xxibl0001sedzq5fwqb96	20	159554ef-c577-47a0-915b-48013c3c4b16-25	z-ai/glm-5-turbo	5162	267	5429	0.0072624	2026-05-13T10:52:37.761Z	0
cmp3xg4fc000137ciu9vkmamj	24	ddb80dcd-4a4a-4301-a4fd-feaabf266b0d-31	z-ai/glm-5-turbo	5178	641	5819	0.0087776	2026-05-13T10:39:06.600Z	0
cmp3wi68q0002fd0bovkdu5ee	177	eb582e5c-310e-4637-980a-98e5149e971d	z-ai/glm-5-turbo	4649	64	4713	0.0058348	2026-05-13T10:12:42.650Z	0
cmp3vdjah0001iveuyd0f31w9	\N	373c3d50-4b81-4e75-b13e-13891d2714f5-31	openai/gpt-4o	1773	159	1932	0.006022500000000001	2026-05-13T09:41:06.665Z	0
cmp3vdaok0007i7po1hneypl7	24	373c3d50-4b81-4e75-b13e-13891d2714f5-31	z-ai/glm-5-turbo	10426	414	10840	0.0141672	2026-05-13T09:40:55.508Z	0
cmp3v7sdk00012hqwzy8qitpv	\N	373c3d50-4b81-4e75-b13e-13891d2714f5-31	openai/gpt-4o	1787	167	1954	0.006137500000000001	2026-05-13T09:36:38.504Z	0
cmp3v7jqr0005i7poynnilh40	24	373c3d50-4b81-4e75-b13e-13891d2714f5-31	z-ai/glm-5-turbo	9528	818	10346	0.0147056	2026-05-13T09:36:27.315Z	0
cmp3v2bz20001giw8bdumy8x7	\N	373c3d50-4b81-4e75-b13e-13891d2714f5-31	openai/gpt-4o	1802	157	1959	0.006075000000000001	2026-05-13T09:32:23.966Z	0
cmp3v23830003i7pouuq766zb	24	373c3d50-4b81-4e75-b13e-13891d2714f5-31	z-ai/glm-5-turbo	8831	836	9667	0.0139412	2026-05-13T09:32:12.627Z	0
cmp3upz6b0001i7pof8y34l8a	24	373c3d50-4b81-4e75-b13e-13891d2714f5-31	z-ai/glm-5-turbo	8071	807	8878	0.0129132	2026-05-13T09:22:47.507Z	0
cmp3umgcn00019g5is9emlsr7	24	666b6899-446f-4fb2-98ee-c3e566e328ee-31	z-ai/glm-5-turbo	8704	744	9448	0.0134208	2026-05-13T09:20:03.143Z	0
cmpdo7b1t0001s39vmn224bxm	20	f2300eac-7a7e-457d-9796-49b287ee1322-25	z-ai/glm-5-turbo	6032	170	6202	0.007918399999999999	2026-05-20T06:18:00.497Z	0
cmpdmlspd0001gbab37kqfbt7	\N	5d8fb07f-7c60-49e8-ae2f-93d8b374a944-26	openai/gpt-4o	1078	140	1218	0.004095000000000001	2026-05-20T05:33:17.329Z	0
cmpdmlkmo0003quw0dtuvlrs1	21	5d8fb07f-7c60-49e8-ae2f-93d8b374a944-26	z-ai/glm-5-turbo	6425	699	7124	0.010506	2026-05-20T05:33:06.864Z	0
cmpdml1f60001quw07f2jqvj6	21	5d8fb07f-7c60-49e8-ae2f-93d8b374a944-26	z-ai/glm-5-turbo	6018	318	6336	0.0084936	2026-05-20T05:32:41.970Z	0
cmpciczo3000111k85keqxn9p	179	9fd4df32-d2fd-4e49-8574-c8e5a34b27ce-189	z-ai/glm-5-turbo	7154	592	7746	0.0109528	2026-05-19T10:46:41.811Z	0
cmpc4e1uh0001ok5pu264zhe0	20	5e4945aa-4fbc-49c1-bac8-5aaa57ae3b70-25	z-ai/glm-5-turbo	6037	203	6240	0.0080564	2026-05-19T04:15:36.665Z	0
cmp3t75h30003yhnz97c4zceu	15	484abe89-e788-428a-b975-a6271bef6d1b-19	z-ai/glm-5-turbo	4786	393	5179	0.007315199999999999	2026-05-13T08:40:09.591Z	0
cmp3t6vuc0001yhnzdmoouh9n	15	484abe89-e788-428a-b975-a6271bef6d1b-19	z-ai/glm-5-turbo	4648	153	4801	0.006189599999999999	2026-05-13T08:39:57.108Z	0
cmp3kjet10001110br1k0jf53	15	1cd91629-7cb6-43dc-8dd1-501095b3046e-19	z-ai/glm-5-turbo	5702	241	5943	0.007806399999999999	2026-05-13T04:37:45.013Z	0
cmp3k53lx00014si34r1x10e8	25	fc95a0be-de01-481d-8e41-0127f40abbb8-32	z-ai/glm-5-turbo	6471	763	7234	0.0108172	2026-05-13T04:26:37.317Z	0
cmp3k3e0n0001i50zgbsd7zg2	25	006f0af1-d971-4e31-b527-aa7b359673b6-32	z-ai/glm-5-turbo	6301	646	6947	0.0101452	2026-05-13T04:25:17.495Z	0
cmp3k2d85000113t2f6jgcdlx	25	e5119c36-d8b0-4fd4-b071-89a2c4f884d0-32	z-ai/glm-5-turbo	4954	170	5124	0.0066248	2026-05-13T04:24:29.813Z	0
cmp3ijufe0002svr703c62jh3	20	148cae9c-a4c4-4321-b013-b693db6d6916	z-ai/glm-5-turbo	4650	57	4707	0.005808	2026-05-13T03:42:06.026Z	0
cmp3hvfjo0001jtzxwuwb5jhh	15	1360356e-7aed-459c-9530-f0e4309f1591-19	z-ai/glm-5-turbo	8101	1310	9411	0.0149612	2026-05-13T03:23:06.996Z	0
cmp3grgm80001j2ibyj9lvtvy	\N	7b06eb12-e24f-4eb0-b713-fa775a393080-36	openai/gpt-4o	1289	129	1418	0.0045125	2026-05-13T02:52:02.144Z	0
cmp3gr8rg0003l3q2i7w0ihzj	29	7b06eb12-e24f-4eb0-b713-fa775a393080-36	z-ai/glm-5-turbo	5926	975	6901	0.0110112	2026-05-13T02:51:51.964Z	0
cmp3go4wy0001l3q21hss1qpp	29	7b06eb12-e24f-4eb0-b713-fa775a393080-36	z-ai/glm-5-turbo	5548	291	5839	0.0078216	2026-05-13T02:49:27.010Z	0
cmp3dx7jc0001y44plkeecsgm	25	c5d137d1-4a50-4497-b4b2-8c26851e192c-32	z-ai/glm-5-turbo	5540	440	5980	0.008407999999999999	2026-05-13T01:32:31.464Z	0
cmp2197f20001vhs42upr0xmd	49	8b82210a-1e24-44a7-a05c-226d8b935787	z-ai/glm-5-turbo	4650	1000	5650	0.00958	2026-05-12T02:50:09.998Z	0
cmp20miix0001lpxwil88b3sd	171	17089742-37f3-4b83-af3c-cd6ece06da20	z-ai/glm-5-turbo	4648	146	4794	0.0061616	2026-05-12T02:32:31.305Z	0
cmp0krmve0001pnffxizp8ouu	\N	13246981-7eba-4f3f-9248-eb24f76aeb78-36	openai/gpt-4o	1044	167	1211	0.004280000000000001	2026-05-11T02:20:50.186Z	0
cmp0kpyak0001rynkp0874gvm	29	13246981-7eba-4f3f-9248-eb24f76aeb78-36	z-ai/glm-5-turbo	4650	53	4703	0.005792	2026-05-11T02:19:31.676Z	0
cmotn5d3w00016yf318b9kfhz	170	63ea6c13-b3af-41a7-84d3-091a6af5ffae	z-ai/glm-5-turbo	4652	701	5353	0.008386399999999999	2026-05-06T05:53:06.716Z	0
cmotjgh2a0001m31ltl7dlf0r	\N	ef8d7e22-24a8-453d-913a-b5ac125c249c	openai/gpt-4o	1176	149	1325	0.004430000000000001	2026-05-06T04:09:46.594Z	0
cmotjg9560003klagy6zkcjob	26	ef8d7e22-24a8-453d-913a-b5ac125c249c	z-ai/glm-5-turbo	9878	814	10692	0.0151096	2026-05-06T04:09:36.330Z	0
cmotjcxlw0001klagk43denzv	26	ef8d7e22-24a8-453d-913a-b5ac125c249c	z-ai/glm-5-turbo	4648	178	4826	0.006289599999999999	2026-05-06T04:07:01.412Z	0
cmotiqkdu0001ivcnsvlafhez	26	79ad9aa0-2817-410e-b30c-da59cc4f7d1a	z-ai/glm-5-turbo	4648	170	4818	0.006257599999999999	2026-05-06T03:49:37.842Z	0
cmotipe1b0001ij9hp4vbi697	168	af8507d2-be07-4c4e-9d4a-75bddcf669ce	z-ai/glm-5-turbo	4650	59	4709	0.005816	2026-05-06T03:48:42.959Z	0
cmoscuxg400018bnitw0p8wf3	40	7f7b14b0-66d9-4da9-8846-0ad07e372d69	z-ai/glm-5-turbo	4593	171	4764	0.0061956	2026-05-05T08:17:17.524Z	0
cmos1gqto00015uiamqfr8jaj	\N	234a8405-4be5-4cc1-b516-fc5fc6bb54dd	openai/gpt-4o	1175	174	1349	0.004677500000000001	2026-05-05T02:58:19.980Z	0
cmos1gieh0003h4mcgw8o4cld	166	234a8405-4be5-4cc1-b516-fc5fc6bb54dd	z-ai/glm-5-turbo	9007	995	10002	0.0147884	2026-05-05T02:58:09.065Z	0
cmos1erry0001h4mckmib8ed5	166	234a8405-4be5-4cc1-b516-fc5fc6bb54dd	z-ai/glm-5-turbo	4655	181	4836	0.00631	2026-05-05T02:56:47.902Z	0
cmos0hjfd000113prn3eslu01	2	68451fb2-d245-4292-8eec-50ab62c8805c-2	z-ai/glm-5-turbo	4649	65	4714	0.0058388	2026-05-05T02:30:57.433Z	0
cmoqsev0o0001ybaupp5pgyqv	165	4187b6d6-7ead-4e37-9715-bf2ec97ad1fc	z-ai/glm-5-turbo	4650	181	4831	0.006304	2026-05-04T05:57:09.384Z	0
cmoqlbi460001v846eiffcxjd	49	85d9d06c-d948-45df-aebc-ee5b353456bf-58	z-ai/glm-5-turbo	8133	938	9071	0.0135116	2026-05-04T02:38:35.382Z	0
cmoql8std0005p9kw5pb71xei	49	cf50a83f-571d-48b0-b12f-5ef5aa149250-58	z-ai/glm-5-turbo	6142	816	6958	0.0106344	2026-05-04T02:36:29.281Z	0
cmoql7c0d0001vvkdfbm2ov6n	\N	cf50a83f-571d-48b0-b12f-5ef5aa149250-58	openai/gpt-4o	1606	146	1752	0.005475000000000001	2026-05-04T02:35:20.845Z	0
cmoql75430003p9kwia54ljpi	49	cf50a83f-571d-48b0-b12f-5ef5aa149250-58	z-ai/glm-5-turbo	5248	446	5694	0.0080816	2026-05-04T02:35:11.907Z	0
cmoql6c5j0001p9kwe2qylaeo	49	cf50a83f-571d-48b0-b12f-5ef5aa149250-58	z-ai/glm-5-turbo	4655	752	5407	0.008594	2026-05-04T02:34:34.375Z	0
cmop4jtz30001b7e8j25m5t3r	163	9bffe1ea-7474-421a-acdc-048162cdb625	z-ai/glm-5-turbo	4651	186	4837	0.0063252	2026-05-03T02:01:24.351Z	0
cmol89uwd0001hqsewsq3hz89	162	c351721e-7a92-4f85-b953-6d7014bc7a25	z-ai/glm-5-turbo	4650	188	4838	0.006332	2026-04-30T08:34:32.749Z	0
cmojvs26h0001cobha4lc0y73	49	a1397556-ae08-45fb-a4f5-eb1638e49602-58	z-ai/glm-5-turbo	4648	176	4824	0.006281599999999999	2026-04-29T09:57:00.809Z	0
cmojlty3b0001kogw6a5ecabc	2	5e9726e8-a415-4f4a-b1b4-39562e7fc196-2	z-ai/glm-5-turbo	4650	166	4816	0.006244	2026-04-29T05:18:32.663Z	0
cmojh0jwe0001o0bxbo1qionr	49	1bd8302b-3073-4aae-8d68-14e33840d51d-58	z-ai/glm-5-turbo	4648	188	4836	0.006329599999999999	2026-04-29T03:03:42.782Z	0
cmojepp7q00014hf9um3syub7	47	e2a09358-a4d2-49ed-8e59-26bde6d8167f-56	z-ai/glm-5-turbo	4658	147	4805	0.0061776	2026-04-29T01:59:17.222Z	0
cmp3uhzya00018djn9qfmb62e	25	fc95a0be-de01-481d-8e41-0127f40abbb8-32	z-ai/glm-5-turbo	7344	1797	9141	0.0160008	2026-05-13T09:16:35.266Z	0
cmp3tjzzt0001ejkidbxna2yd	\N	484abe89-e788-428a-b975-a6271bef6d1b-19	openai/gpt-4o	1161	160	1321	0.0045025	2026-05-13T08:50:09.017Z	0
cmp3tjsve0007yhnz0s4zby48	15	484abe89-e788-428a-b975-a6271bef6d1b-19	z-ai/glm-5-turbo	5808	1868	7676	0.0144416	2026-05-13T08:49:59.786Z	0
cmp3tcr9v000110agbpe1n95x	\N	484abe89-e788-428a-b975-a6271bef6d1b-19	openai/gpt-4o	1093	147	1240	0.004202500000000001	2026-05-13T08:44:31.123Z	0
cmp3tcjm00005yhnz7dq0zl1b	15	484abe89-e788-428a-b975-a6271bef6d1b-19	z-ai/glm-5-turbo	4870	649	5519	0.00844	2026-05-13T08:44:21.192Z	0
cmp3t7doh0001nkcg8y87kvre	\N	484abe89-e788-428a-b975-a6271bef6d1b-19	openai/gpt-4o	1131	138	1269	0.0042075	2026-05-13T08:40:20.225Z	0
cmo8ibvdd000112e3d1zmtk6i	\N	d3317571-0edd-4f7f-ae43-686291f3d264-170	openai/gpt-4o	1201	143	1344	0.004432500000000001	2026-04-21T10:55:02.545Z	0
cmo8ibl8c0005sqnadmcot1x7	160	d3317571-0edd-4f7f-ae43-686291f3d264-170	z-ai/glm-5-turbo	4885	363	5248	0.007314	2026-04-21T10:54:49.404Z	0
cmo8i5wze0001ds56k4nu467k	\N	d3317571-0edd-4f7f-ae43-686291f3d264-170	openai/gpt-4o	1034	109	1143	0.003675	2026-04-21T10:50:24.698Z	0
cmo8i5nxc0003sqnacxolsj6w	160	d3317571-0edd-4f7f-ae43-686291f3d264-170	z-ai/glm-5-turbo	4686	221	4907	0.0065072	2026-04-21T10:50:12.960Z	0
cmo8i4xce0001sqnanqeius5x	160	d3317571-0edd-4f7f-ae43-686291f3d264-170	z-ai/glm-5-turbo	4661	41	4702	0.0057572	2026-04-21T10:49:38.510Z	0
cmo8f0dcd0001rv0fgpur561v	\N	588dc52f-308a-4dcf-af2c-98d983458675-35	openai/gpt-4o	1191	156	1347	0.0045375	2026-04-21T09:22:07.117Z	0
cmo8f03og0003md0hmageak8f	28	588dc52f-308a-4dcf-af2c-98d983458675-35	z-ai/glm-5-turbo	4836	94	4930	0.006179199999999999	2026-04-21T09:21:54.592Z	0
cmo8ei34c0001md0hfkivkojh	28	588dc52f-308a-4dcf-af2c-98d983458675-35	z-ai/glm-5-turbo	4648	225	4873	0.006477599999999999	2026-04-21T09:07:54.060Z	0
cmo83mj3i0001exze56tekepu	\N	4bd9dc88-906d-4087-8800-28be5ff8157f-50	openai/gpt-4o	2058	154	2212	0.006685	2026-04-21T04:03:25.614Z	0
cmo83mc03000l2rxacsfp9mg1	43	4bd9dc88-906d-4087-8800-28be5ff8157f-50	z-ai/glm-5-turbo	12496	161	12657	0.0156392	2026-04-21T04:03:16.419Z	0
cmo82u53i0001yl8zn0lnjsad	\N	4bd9dc88-906d-4087-8800-28be5ff8157f-50	openai/gpt-4o	1667	141	1808	0.0055775	2026-04-21T03:41:21.102Z	0
cmo82txi5000j2rxacmeyt164	43	4bd9dc88-906d-4087-8800-28be5ff8157f-50	z-ai/glm-5-turbo	11367	1210	12577	0.0184804	2026-04-21T03:41:11.261Z	0
cmo82a5vr0001czbgd3nyj629	\N	4bd9dc88-906d-4087-8800-28be5ff8157f-50	openai/gpt-4o	1839	128	1967	0.0058775	2026-04-21T03:25:48.999Z	0
cmo829za6000h2rxaaghb35vp	43	4bd9dc88-906d-4087-8800-28be5ff8157f-50	z-ai/glm-5-turbo	10630	805	11435	0.015976	2026-04-21T03:25:40.446Z	0
cmo81zjkl0001taqrittbrqef	\N	4bd9dc88-906d-4087-8800-28be5ff8157f-50	openai/gpt-4o	1589	158	1747	0.0055525	2026-04-21T03:17:33.525Z	0
cmo81yadt0001yvgpoze0548q	\N	4bd9dc88-906d-4087-8800-28be5ff8157f-50	openai/gpt-4o	1829	151	1980	0.0060825	2026-04-21T03:16:34.961Z	0
cmo81y2ua000d2rxafj8cshyn	43	4bd9dc88-906d-4087-8800-28be5ff8157f-50	z-ai/glm-5-turbo	9068	768	9836	0.0139536	2026-04-21T03:16:25.186Z	0
cmo81x4bh0001i8q7m3pt0h02	\N	4bd9dc88-906d-4087-8800-28be5ff8157f-50	openai/gpt-4o	1063	142	1205	0.0040775	2026-04-21T03:15:40.445Z	0
cmo81wx01000b2rxajhejbio1	43	4bd9dc88-906d-4087-8800-28be5ff8157f-50	z-ai/glm-5-turbo	8166	1169	9335	0.0144752	2026-04-21T03:15:30.961Z	0
cmo81w6rc0001z6h13t50mokd	\N	4bd9dc88-906d-4087-8800-28be5ff8157f-50	openai/gpt-4o	964	122	1086	0.00363	2026-04-21T03:14:56.952Z	0
cmo81vzf400092rxazc7s7uhz	43	4bd9dc88-906d-4087-8800-28be5ff8157f-50	z-ai/glm-5-turbo	8033	145	8178	0.0102196	2026-04-21T03:14:47.440Z	0
cmo81vj890001134pmaa072cm	\N	4bd9dc88-906d-4087-8800-28be5ff8157f-50	openai/gpt-4o	1022	127	1149	0.003825	2026-04-21T03:14:26.457Z	0
cmo81vb2y00072rxag7fezv14	43	4bd9dc88-906d-4087-8800-28be5ff8157f-50	z-ai/glm-5-turbo	7362	516	7878	0.0108984	2026-04-21T03:14:15.898Z	0
cmo81usil0001rrd7op6k4j7u	\N	4bd9dc88-906d-4087-8800-28be5ff8157f-50	openai/gpt-4o	1069	125	1194	0.003922500000000001	2026-04-21T03:13:51.837Z	0
cmo81ul8600052rxah8emhoar	43	4bd9dc88-906d-4087-8800-28be5ff8157f-50	z-ai/glm-5-turbo	5621	413	6034	0.0083972	2026-04-21T03:13:42.390Z	0
cmo81tuvz0001sm9j6l6rh8z0	\N	4bd9dc88-906d-4087-8800-28be5ff8157f-50	openai/gpt-4o	969	147	1116	0.0038925	2026-04-21T03:13:08.255Z	0
cmo81tmq100032rxahrjp8wu3	43	4bd9dc88-906d-4087-8800-28be5ff8157f-50	z-ai/glm-5-turbo	5480	158	5638	0.007207999999999999	2026-04-21T03:12:57.673Z	0
cmo818s8m00012rxaop0cxsqo	43	4bd9dc88-906d-4087-8800-28be5ff8157f-50	z-ai/glm-5-turbo	4949	369	5318	0.0074148	2026-04-21T02:56:45.046Z	0
cmo80dpwz000111mpfxhm0ppz	\N	bdc30824-5bd6-473a-b97e-e5d57685bfe9-50	openai/gpt-4o	1157	135	1292	0.0042425	2026-04-21T02:32:35.699Z	0
cmo80dhbv000fxsmyhqpcuw8b	43	bdc30824-5bd6-473a-b97e-e5d57685bfe9-50	z-ai/glm-5-turbo	28163	1562	29725	0.0400436	2026-04-21T02:32:24.571Z	0
cmo807uxh000dxsmyib1y41xj	43	bdc30824-5bd6-473a-b97e-e5d57685bfe9-50	z-ai/glm-5-turbo	24111	572	24683	0.0312212	2026-04-21T02:28:02.261Z	0
cmo807cyp0001aoxlz8kc6sc6	\N	bdc30824-5bd6-473a-b97e-e5d57685bfe9-50	openai/gpt-4o	988	177	1165	0.004240000000000001	2026-04-21T02:27:38.977Z	0
cmo8075a1000bxsmyozxlxy6v	43	bdc30824-5bd6-473a-b97e-e5d57685bfe9-50	z-ai/glm-5-turbo	20664	287	20951	0.0259448	2026-04-21T02:27:29.017Z	0
cmo7z0k5o0009xsmylqcoeklg	43	bdc30824-5bd6-473a-b97e-e5d57685bfe9-50	z-ai/glm-5-turbo	19735	793	20528	0.026854	2026-04-21T01:54:22.092Z	0
cmo7yvm280001ycsxnyp1urii	\N	bdc30824-5bd6-473a-b97e-e5d57685bfe9-50	openai/gpt-4o	2414	149	2563	0.007525	2026-04-21T01:50:31.280Z	0
cmo7yveiw0007xsmyy3yvvmib	43	bdc30824-5bd6-473a-b97e-e5d57685bfe9-50	z-ai/glm-5-turbo	20770	268	21038	0.025996	2026-04-21T01:50:21.512Z	0
cmo7yj06s0001od9njc8qmfy9	\N	bdc30824-5bd6-473a-b97e-e5d57685bfe9-50	openai/gpt-4o	1178	148	1326	0.004425	2026-04-21T01:40:43.060Z	0
cmo7yiom90005xsmylmrg3q4d	43	bdc30824-5bd6-473a-b97e-e5d57685bfe9-50	z-ai/glm-5-turbo	17178	1467	18645	0.0264816	2026-04-21T01:40:28.065Z	0
cmo7yeep60003xsmyfpy4ylqc	43	bdc30824-5bd6-473a-b97e-e5d57685bfe9-50	z-ai/glm-5-turbo	13327	551	13878	0.0181964	2026-04-21T01:37:08.586Z	0
cmob1fya80001arnxc0u9283f	\N	92ebf69d-656e-4521-9369-3426bf1b0502-56	openai/gpt-4o	1720	157	1877	0.00587	2026-04-23T05:25:38.000Z	0
cmob1fox00003y1b5kabynhcx	47	92ebf69d-656e-4521-9369-3426bf1b0502-56	z-ai/glm-5-turbo	8317	282	8599	0.0111084	2026-04-23T05:25:25.860Z	0
cmob1ejuv0001geejfkkn3off	\N	8825749d-4334-4c04-adc3-7d1ec1a7a1bd-56	openai/gpt-4o	7862	166	8028	0.021315	2026-04-23T05:24:32.647Z	0
cmob1e7eb0003nvyydheezzrb	47	8825749d-4334-4c04-adc3-7d1ec1a7a1bd-56	z-ai/glm-5-turbo	34258	5086	39344	0.0614536	2026-04-23T05:24:16.499Z	0
cmob1a2060001y1b58ep54nao	47	92ebf69d-656e-4521-9369-3426bf1b0502-56	z-ai/glm-5-turbo	7570	739	8309	0.01204	2026-04-23T05:21:02.886Z	0
cmob16ygf0001nvyypp0gprzp	47	8825749d-4334-4c04-adc3-7d1ec1a7a1bd-56	z-ai/glm-5-turbo	29934	5096	35030	0.0563048	2026-04-23T05:18:38.319Z	0
cmnzqber80001pminn6k7i7qz	\N	89bfd87d-8047-4f37-a5f0-e9d021b0dc4b-32	openai/gpt-4o	776	117	893	0.00311	2026-04-15T07:28:42.356Z	0
cmnzqb7xx0005om1aqtmcga0s	25	89bfd87d-8047-4f37-a5f0-e9d021b0dc4b-32	z-ai/glm-5-turbo	8391	176	8567	0.0107732	2026-04-15T07:28:33.525Z	0
cmnzqa1aq0001dtqckelekcru	\N	89bfd87d-8047-4f37-a5f0-e9d021b0dc4b-32	openai/gpt-4o	876	149	1025	0.00368	2026-04-15T07:27:38.258Z	0
cmnzq9sp20003om1alssvqhje	25	89bfd87d-8047-4f37-a5f0-e9d021b0dc4b-32	z-ai/glm-5-turbo	4676	42	4718	0.005779199999999999	2026-04-15T07:27:27.110Z	0
cmnzq7ore0001om1az4qodgm5	25	89bfd87d-8047-4f37-a5f0-e9d021b0dc4b-32	z-ai/glm-5-turbo	4363	171	4534	0.0059196	2026-04-15T07:25:48.698Z	0
cmnzjfgme0001t9iiu8r0ur1b	29	4904d201-cc09-4dc4-be89-e46421f17a51-36	z-ai/glm-5-turbo	4371	75	4446	0.005545199999999999	2026-04-15T04:15:54.086Z	0
cmnyspksf0001zimjrlcpsp6q	29	1bae5280-fae3-436f-af40-9a4871358f05-36	z-ai/glm-5-turbo	4378	602	4980	0.007661599999999999	2026-04-14T15:47:56.415Z	0
cmnysopdb0001i3g9hx7km2qb	\N	7070773a-b57e-44ca-96ee-48cdb9017486-36	openai/gpt-4o	772	124	896	0.00317	2026-04-14T15:47:15.695Z	0
cmnysohkz0003laeykgkyaztf	29	7070773a-b57e-44ca-96ee-48cdb9017486-36	z-ai/glm-5-turbo	4415	40	4455	0.005457999999999999	2026-04-14T15:47:05.603Z	0
cmnyso51i0001laeyv1mno11w	29	7070773a-b57e-44ca-96ee-48cdb9017486-36	z-ai/glm-5-turbo	4376	53	4429	0.005463200000000001	2026-04-14T15:46:49.350Z	0
cmnydaxez000110i4ehewptyv	157	16ec3832-179a-4c40-8511-646a7daa4c31	z-ai/glm-5-turbo	4366	85	4451	0.005579199999999999	2026-04-14T08:36:38.699Z	0
cmnyd24k40001fkrg6grnd1zc	157	12af829e-1b00-423d-97e0-32c7eb5c8920	z-ai/glm-5-turbo	4377	136	4513	0.0057964	2026-04-14T08:29:48.052Z	0
cmnycy63c0001ezdhbcongidd	\N	9571937f-05b9-46fa-9e9d-db74e1f5f85b	openai/gpt-4o	870	131	1001	0.003485	2026-04-14T08:26:43.416Z	0
cmnycxxdp000111dcotaschfz	57	9571937f-05b9-46fa-9e9d-db74e1f5f85b	z-ai/glm-5-turbo	4504	167	4671	0.0060728	2026-04-14T08:26:32.125Z	0
cmnycugf40001vn0azacnaolw	57	8a3d2e56-3697-446e-b67a-311ff417273f-66	z-ai/glm-5-turbo	0	0	0	0	2026-04-14T08:23:50.176Z	0
cmny2ls980001xnxo95x03b9v	156	b7ade2b9-4530-4ce5-ae11-c94d49792f24	z-ai/glm-5-turbo	4374	147	4521	0.0058368	2026-04-14T03:37:09.452Z	0
cmny0hpdg0001nvqgnpbsrdw8	57	e4a6da85-c5de-4f2a-99f2-a5ca5ef056dd	z-ai/glm-5-turbo	4374	71	4445	0.005532799999999999	2026-04-14T02:37:59.860Z	0
cmnskwe3x000dn834zq04v4c4	154	1b29a412-b4f2-4e88-a2d9-8875d87f003f	z-ai/glm-5-turbo	13232	645	13877	0.0184584	2026-04-10T07:22:40.365Z	0
cmnskv7fc0001ovalnzo0fso2	\N	1b29a412-b4f2-4e88-a2d9-8875d87f003f	openai/gpt-4o	1193	142	1335	0.0044025	2026-04-10T07:21:45.048Z	0
cmnskuzmp000bn834r57m8fb3	154	1b29a412-b4f2-4e88-a2d9-8875d87f003f	z-ai/glm-5-turbo	7363	460	7823	0.0106756	2026-04-10T07:21:34.945Z	0
cmnskt31f00012b3lft0igti4	\N	1b29a412-b4f2-4e88-a2d9-8875d87f003f	openai/gpt-4o	926	132	1058	0.003635	2026-04-10T07:20:06.051Z	0
cmnsksuo00009n834p5pj2r1k	154	1b29a412-b4f2-4e88-a2d9-8875d87f003f	z-ai/glm-5-turbo	11101	211	11312	0.0141652	2026-04-10T07:19:55.200Z	0
cmnskqv0d0001k58a82i09l6h	\N	1b29a412-b4f2-4e88-a2d9-8875d87f003f	openai/gpt-4o	1320	137	1457	0.004670000000000001	2026-04-10T07:18:22.333Z	0
cmnskqnly0007n8348203w1ew	154	1b29a412-b4f2-4e88-a2d9-8875d87f003f	z-ai/glm-5-turbo	6664	622	7286	0.0104848	2026-04-10T07:18:12.742Z	0
cmnskpruc0005n8340eu9ndu8	154	1b29a412-b4f2-4e88-a2d9-8875d87f003f	z-ai/glm-5-turbo	4426	470	4896	0.007191199999999999	2026-04-10T07:17:31.572Z	0
cmnskoc560001u7d9tp467bi0	\N	1b29a412-b4f2-4e88-a2d9-8875d87f003f	openai/gpt-4o	774	138	912	0.003315	2026-04-10T07:16:24.570Z	0
cmnsko3s10003n834x3fqbngv	154	1b29a412-b4f2-4e88-a2d9-8875d87f003f	z-ai/glm-5-turbo	4425	611	5036	0.007754	2026-04-10T07:16:13.729Z	0
cmnskkxiu0001n834ld9lzirj	154	1b29a412-b4f2-4e88-a2d9-8875d87f003f	z-ai/glm-5-turbo	4381	52	4433	0.0054652	2026-04-10T07:13:45.654Z	0
cmnr8z41p0001xarwejwuj3th	\N	b7046882-d18e-451c-b464-a3df1b20b001-45	openai/gpt-4o	1080	138	1218	0.00408	2026-04-09T09:01:05.725Z	0
cmnr8yvko0007r64j1blb33yn	38	b7046882-d18e-451c-b464-a3df1b20b001-45	z-ai/glm-5-turbo	5184	715	5899	0.0090808	2026-04-09T09:00:54.744Z	0
cmnr8y0y00001qgc82cua3sbf	\N	b7046882-d18e-451c-b464-a3df1b20b001-45	openai/gpt-4o	839	131	970	0.0034075	2026-04-09T09:00:15.048Z	0
cmnr8xte90005r64j6i6al6ok	38	b7046882-d18e-451c-b464-a3df1b20b001-45	z-ai/glm-5-turbo	4856	383	5239	0.0073592	2026-04-09T09:00:05.265Z	0
cmnr8xep40001aefmqb9wemse	\N	b7046882-d18e-451c-b464-a3df1b20b001-45	openai/gpt-4o	1099	131	1230	0.0040575	2026-04-09T08:59:46.216Z	0
cmnr8x6se0003r64jeuvyaqha	38	b7046882-d18e-451c-b464-a3df1b20b001-45	z-ai/glm-5-turbo	4702	222	4924	0.0065304	2026-04-09T08:59:35.966Z	0
cmnr8vs2w0001r64jbozwl2sm	38	b7046882-d18e-451c-b464-a3df1b20b001-45	z-ai/glm-5-turbo	4356	397	4753	0.0068152	2026-04-09T08:58:30.248Z	0
cmnqzl04600013qythin2126m	15	cd317f07-d576-44bc-b8b6-06d63978b5b4-19	z-ai/glm-5-turbo	5314	604	5918	0.0087928	2026-04-09T04:38:10.902Z	0
cmnps86aa0003x07jdbqfew4n	47	6ddb7deb-f05f-4023-b475-29dc3c755048-56	z-ai/glm-5-turbo	2366	142	2508	0.0034072	2026-04-08T08:24:28.882Z	0
cmnps7dpe0001x07jg8zwmypv	47	6ddb7deb-f05f-4023-b475-29dc3c755048-56	z-ai/glm-5-turbo	4382	168	4550	0.0059304	2026-04-08T08:23:51.842Z	0
cmnpgbbzr0001t7y5elmh2xdd	\N	02361018-ce58-4883-9c8d-1da60ac62f60-56	openai/gpt-4o	989	157	1146	0.004042500000000001	2026-04-08T02:51:00.855Z	0
cmo6tqyiv000112ix8ifjly52	47	1b394180-501f-4484-9b84-51b6433bd7cc	z-ai/glm-5-turbo	4470	187	4657	0.006111999999999999	2026-04-20T06:39:09.895Z	0
cmo6t2t0d0001girjmgzfmohk	158	7dc37219-00d0-4034-b0e8-312772513120	z-ai/glm-5-turbo	4470	173	4643	0.006056	2026-04-20T06:20:23.005Z	0
cmo0uuvjz0005cd4l856kisq3	43	1b9269e9-3199-4282-854d-7901d51b0b94-50	z-ai/glm-5-turbo	0	0	0	0	2026-04-16T02:23:35.231Z	0
cmo0urikm000113wsiuic7t79	\N	1b9269e9-3199-4282-854d-7901d51b0b94-50	openai/gpt-4o	772	139	911	0.00332	2026-04-16T02:20:58.438Z	0
cmo0urae70003cd4lrg6m82bt	43	1b9269e9-3199-4282-854d-7901d51b0b94-50	z-ai/glm-5-turbo	6796	420	7216	0.009835199999999999	2026-04-16T02:20:47.839Z	0
cmo0umwdl0001cd4lwjist4rx	43	1b9269e9-3199-4282-854d-7901d51b0b94-50	z-ai/glm-5-turbo	6028	547	6575	0.009421599999999999	2026-04-16T02:17:23.049Z	0
cmnpfygxq0005ll31aou5xyg8	47	02361018-ce58-4883-9c8d-1da60ac62f60-56	z-ai/glm-5-turbo	6301	325	6626	0.0088612	2026-04-08T02:41:00.734Z	0
cmnpftmxh0003ll31ds5fvtd3	47	02361018-ce58-4883-9c8d-1da60ac62f60-56	z-ai/glm-5-turbo	5741	636	6377	0.0094332	2026-04-08T02:37:15.221Z	0
cmnpfr29r0001ll319cwoge9h	47	02361018-ce58-4883-9c8d-1da60ac62f60-56	z-ai/glm-5-turbo	5560	2267	7827	0.01574	2026-04-08T02:35:15.135Z	0
cmnoqv4qf0001i2y2yuteg959	47	fdbe8194-e023-444f-bc28-8978ad2d2fa0-56	z-ai/glm-5-turbo	4382	173	4555	0.0059504	2026-04-07T14:58:34.551Z	0
cmnoeouu000098dulf4fa8vww	43	36c65935-9e8f-4694-9d17-07a9fec2f53c-50	z-ai/glm-5-turbo	4992	953	5945	0.0098024	2026-04-07T09:17:46.392Z	0
cmnoeb3t000053palqo6dcnhu	28	fbfc3054-972e-4016-8791-b0c995e59c9e	z-ai/glm-5-turbo	9444	244	9688	0.0123088	2026-04-07T09:07:04.836Z	0
cmnoe9cwp00033palfegxv2ak	28	fbfc3054-972e-4016-8791-b0c995e59c9e	z-ai/glm-5-turbo	7112	240	7352	0.0094944	2026-04-07T09:05:43.321Z	0
cmnoe90yc00078dulgs88yejo	43	36c65935-9e8f-4694-9d17-07a9fec2f53c-50	z-ai/glm-5-turbo	4984	119	5103	0.0064568	2026-04-07T09:05:27.828Z	0
cmnoe8u7o00013paldxvvfvfh	28	fbfc3054-972e-4016-8791-b0c995e59c9e	z-ai/glm-5-turbo	7073	81	7154	0.0088116	2026-04-07T09:05:19.092Z	0
cmnoe8lse00058dulqrkvyyde	43	36c65935-9e8f-4694-9d17-07a9fec2f53c-50	z-ai/glm-5-turbo	4400	706	5106	0.008104	2026-04-07T09:05:08.174Z	0
cmnoe7tat00038dulymqamri6	43	36c65935-9e8f-4694-9d17-07a9fec2f53c-50	z-ai/glm-5-turbo	4399	448	4847	0.0070708	2026-04-07T09:04:31.253Z	0
cmnoe77yf00018dulbxsejjzm	43	36c65935-9e8f-4694-9d17-07a9fec2f53c-50	z-ai/glm-5-turbo	4644	403	5047	0.0071848	2026-04-07T09:04:03.591Z	0
cmnoe753d000fuqwfr8e2cpvl	28	3c55ff0e-d4f1-40db-bfb3-78705074aa8f-35	z-ai/glm-5-turbo	13047	142	13189	0.0162244	2026-04-07T09:03:59.881Z	0
cmnoe6ehw000duqwftjt7xd5e	28	3c55ff0e-d4f1-40db-bfb3-78705074aa8f-35	z-ai/glm-5-turbo	10189	200	10389	0.0130268	2026-04-07T09:03:25.412Z	0
cmnoe56nk000buqwfda6ejm04	28	3c55ff0e-d4f1-40db-bfb3-78705074aa8f-35	z-ai/glm-5-turbo	7373	403	7776	0.0104596	2026-04-07T09:02:28.592Z	0
cmnoe37ch00011yru9l6z76tx	\N	3c55ff0e-d4f1-40db-bfb3-78705074aa8f-35	openai/gpt-4o	870	151	1021	0.003685	2026-04-07T09:00:56.177Z	0
cmnoe30930007uqwfm8e6jhio	28	3c55ff0e-d4f1-40db-bfb3-78705074aa8f-35	z-ai/glm-5-turbo	7234	174	7408	0.0093768	2026-04-07T09:00:46.983Z	0
cmnoe2i720005uqwf9im45yr9	28	3c55ff0e-d4f1-40db-bfb3-78705074aa8f-35	z-ai/glm-5-turbo	9098	374	9472	0.0124136	2026-04-07T09:00:23.582Z	0
cmnoe1dac0001in1bk2ybro1y	\N	3c55ff0e-d4f1-40db-bfb3-78705074aa8f-35	openai/gpt-4o	774	148	922	0.003415000000000001	2026-04-07T08:59:30.564Z	0
cmnoe144q0003uqwfk2reikpb	28	3c55ff0e-d4f1-40db-bfb3-78705074aa8f-35	z-ai/glm-5-turbo	7136	146	7282	0.0091472	2026-04-07T08:59:18.698Z	0
cmnoe0ikk0001uqwflxos1a99	28	3c55ff0e-d4f1-40db-bfb3-78705074aa8f-35	z-ai/glm-5-turbo	4382	58	4440	0.005490399999999999	2026-04-07T08:58:50.756Z	0
cmnodzzkb0001cvt2yrgzsodu	\N	dc655ebb-4219-4148-b227-b8a3f4014fc5-35	openai/gpt-4o	1112	147	1259	0.00425	2026-04-07T08:58:26.123Z	0
cmnodzqz20007qhc4r6brhvgj	28	dc655ebb-4219-4148-b227-b8a3f4014fc5-35	z-ai/glm-5-turbo	7761	623	8384	0.0118052	2026-04-07T08:58:14.990Z	0
cmnodxzn10005qhc4xthp3u6u	28	dc655ebb-4219-4148-b227-b8a3f4014fc5-35	z-ai/glm-5-turbo	7097	130	7227	0.0090364	2026-04-07T08:56:52.909Z	0
cmnodx59t000112gqumfhjp8p	\N	dc655ebb-4219-4148-b227-b8a3f4014fc5-35	openai/gpt-4o	770	137	907	0.003295	2026-04-07T08:56:13.553Z	0
cmnodwx6y0003qhc4i91415db	28	dc655ebb-4219-4148-b227-b8a3f4014fc5-35	z-ai/glm-5-turbo	4420	396	4816	0.006888	2026-04-07T08:56:03.082Z	0
cmnodwc9w0001qhc4je377da8	28	dc655ebb-4219-4148-b227-b8a3f4014fc5-35	z-ai/glm-5-turbo	4381	53	4434	0.0054692	2026-04-07T08:55:35.972Z	0
cmnodvi4b0003y5k7wd5gcva3	28	98c51e81-8f0a-4ea6-ac62-6536abb3e998-35	z-ai/glm-5-turbo	10593	589	11182	0.0150676	2026-04-07T08:54:56.891Z	0
cmnodu2nn0001y5k7kb1sd1g0	28	98c51e81-8f0a-4ea6-ac62-6536abb3e998-35	z-ai/glm-5-turbo	4386	479	4865	0.0071792	2026-04-07T08:53:50.195Z	0
cmnodoyqg0001jgwbty6ds63f	28	c29e21bb-174c-4b2e-9b92-0a8d2c2d3dfa-35	z-ai/glm-5-turbo	4389	417	4806	0.0069348	2026-04-07T08:49:51.832Z	0
cmnodadsd0001xdn55ij35581	\N	98c51e81-8f0a-4ea6-ac62-6536abb3e998-35	openai/gpt-4o	1360	135	1495	0.004750000000000001	2026-04-07T08:38:31.501Z	0
cmnoda6ou0005htuvi1al0iwj	28	98c51e81-8f0a-4ea6-ac62-6536abb3e998-35	z-ai/glm-5-turbo	5623	874	6497	0.0102436	2026-04-07T08:38:22.302Z	0
cmnod8par0001tg07xgxxv7eb	\N	98c51e81-8f0a-4ea6-ac62-6536abb3e998-35	openai/gpt-4o	1356	119	1475	0.004580000000000001	2026-04-07T08:37:13.107Z	0
cmnod8gs60003htuvv46mrm2c	28	98c51e81-8f0a-4ea6-ac62-6536abb3e998-35	z-ai/glm-5-turbo	5003	647	5650	0.0085916	2026-04-07T08:37:02.070Z	0
cmnod69k10001htuv3hnnmbyw	28	98c51e81-8f0a-4ea6-ac62-6536abb3e998-35	z-ai/glm-5-turbo	4387	646	5033	0.0078484	2026-04-07T08:35:19.393Z	0
cmnod4vdl0001p1njmeyg2mmh	\N	3d4242e3-2bf9-4488-898c-7e287165b922-35	openai/gpt-4o	777	112	889	0.0030625	2026-04-07T08:34:14.361Z	0
cmnod4ng70003mmexwwnt84ad	28	3d4242e3-2bf9-4488-898c-7e287165b922-35	z-ai/glm-5-turbo	7110	154	7264	0.009148	2026-04-07T08:34:04.087Z	0
cmnod3qk20001mmexxblgbij6	28	3d4242e3-2bf9-4488-898c-7e287165b922-35	z-ai/glm-5-turbo	4384	56	4440	0.0054848	2026-04-07T08:33:21.458Z	0
cmnocmk5q0001132aweq5z460	42	84f7daaf-e9c2-40ba-8259-7c1dafd902db-49	z-ai/glm-5-turbo	6719	380	7099	0.0095828	2026-04-07T08:20:00.014Z	0
cmnpg9b8x000dll31ucqosgqq	47	02361018-ce58-4883-9c8d-1da60ac62f60-56	z-ai/glm-5-turbo	4814	447	5261	0.007564799999999999	2026-04-08T02:49:26.577Z	0
cmnpg7eja0001mfajykgb6say	\N	02361018-ce58-4883-9c8d-1da60ac62f60-56	openai/gpt-4o	1047	133	1180	0.0039475	2026-04-08T02:47:57.526Z	0
cmnpg76az000bll31i3diluby	47	02361018-ce58-4883-9c8d-1da60ac62f60-56	z-ai/glm-5-turbo	6612	638	7250	0.0104864	2026-04-08T02:47:46.859Z	0
cmnpg6m390009ll31rh76brwu	47	02361018-ce58-4883-9c8d-1da60ac62f60-56	z-ai/glm-5-turbo	4922	35	4957	0.0060464	2026-04-08T02:47:20.661Z	0
cmnpg41fp0007ll31lc9i3agd	47	02361018-ce58-4883-9c8d-1da60ac62f60-56	z-ai/glm-5-turbo	4444	26	4470	0.005436799999999999	2026-04-08T02:45:20.581Z	0
cmnpfyopf0001149yso2ddaw5	\N	02361018-ce58-4883-9c8d-1da60ac62f60-56	openai/gpt-4o	1305	134	1439	0.004602500000000001	2026-04-08T02:41:10.803Z	0
cmnlt5e2k000513f6387qyuax	49	d480d79d-9f7a-498f-a835-429e734463be-58	z-ai/glm-5-turbo	5463	757	6220	0.0095836	2026-04-05T13:39:13.916Z	0
cmnlt4r5a0001rnv0m0ia7msc	\N	d480d79d-9f7a-498f-a835-429e734463be-58	openai/gpt-4o	1100	131	1231	0.00406	2026-04-05T13:38:44.206Z	0
cmnlt4jde000313f6kehpumbs	49	d480d79d-9f7a-498f-a835-429e734463be-58	z-ai/glm-5-turbo	4850	714	5564	0.008676	2026-04-05T13:38:34.130Z	0
cmnlt2ft8000113f6z6qj4puv	49	d480d79d-9f7a-498f-a835-429e734463be-58	z-ai/glm-5-turbo	4387	501	4888	0.0072684	2026-04-05T13:36:56.204Z	0
cmniqba630001kqa154y2oy6v	\N	cd2dfccd-8d59-4d1b-bb9f-92a3cbb2d5d3-66	openai/gpt-4o	1984	160	2144	0.00656	2026-04-03T09:56:31.419Z	0
cmniqb2fb00056p8874czjnus	57	cd2dfccd-8d59-4d1b-bb9f-92a3cbb2d5d3-66	z-ai/glm-5-turbo	15321	1210	16531	0.0232252	2026-04-03T09:56:21.383Z	0
cmniq23lx00011094k4zlr9ho	57	4d91d051-99cc-4893-8a16-d11a392a8937-66	z-ai/glm-5-turbo	4396	619	5015	0.0077512	2026-04-03T09:49:23.013Z	0
cmnipy8tr0001569fbufec0mj	\N	cd2dfccd-8d59-4d1b-bb9f-92a3cbb2d5d3-66	openai/gpt-4o	1325	152	1477	0.0048325	2026-04-03T09:46:23.151Z	0
cmnipy0f400036p888ikiq310	57	cd2dfccd-8d59-4d1b-bb9f-92a3cbb2d5d3-66	z-ai/glm-5-turbo	11289	1263	12552	0.0185988	2026-04-03T09:46:12.256Z	0
cmniplj8a00016p88qklfpefm	57	cd2dfccd-8d59-4d1b-bb9f-92a3cbb2d5d3-66	z-ai/glm-5-turbo	4384	656	5040	0.007884799999999999	2026-04-03T09:36:30.106Z	0
cmnipje040001hcjg9rjcopcw	57	e9c84fd2-ebf4-46b6-be62-afd52dd70c9a-66	z-ai/glm-5-turbo	7011	656	7667	0.0110372	2026-04-03T09:34:50.020Z	0
cmnihpawr0001d9mwpegkx04f	47	2773afd6-8fbd-4736-9630-42c9c66950de-56	z-ai/glm-5-turbo	7557	866	8423	0.0125324	2026-04-03T05:55:29.019Z	0
cmnihox2k0001scsushapynyd	\N	33eb4970-d402-4165-9ca2-87300148ceb9-56	openai/gpt-4o	1060	124	1184	0.00389	2026-04-03T05:55:11.084Z	0
cmnihopo40007yjfk7fixo90r	47	33eb4970-d402-4165-9ca2-87300148ceb9-56	z-ai/glm-5-turbo	8767	323	9090	0.0118124	2026-04-03T05:55:01.492Z	0
cmniho9d60001i8fcdjbu56ws	\N	33eb4970-d402-4165-9ca2-87300148ceb9-56	openai/gpt-4o	991	142	1133	0.0038975	2026-04-03T05:54:40.362Z	0
cmnihniop0001cns57j23oqew	\N	33eb4970-d402-4165-9ca2-87300148ceb9-56	openai/gpt-4o	718	134	852	0.003135	2026-04-03T05:54:05.785Z	0
cmnihnaaj0003yjfkka5spgmz	47	33eb4970-d402-4165-9ca2-87300148ceb9-56	z-ai/glm-5-turbo	5091	344	5435	0.007485199999999999	2026-04-03T05:53:54.907Z	0
cmnihh3ac0001yjfk7dqglsi2	47	33eb4970-d402-4165-9ca2-87300148ceb9-56	z-ai/glm-5-turbo	4392	613	5005	0.007722399999999999	2026-04-03T05:49:05.892Z	0
cmnigjrbw00015wyk2unepo8r	47	a11e4bc4-8e4e-4ce4-8503-8b57da30a63e-56	z-ai/glm-5-turbo	6663	220	6883	0.0088756	2026-04-03T05:23:10.748Z	0
cmnig3bl400012thue4u3hhpd	57	a6e71774-eeae-4ba9-b476-2f81c6688b66-66	z-ai/glm-5-turbo	4945	309	5254	0.00717	2026-04-03T05:10:23.848Z	0
cmnha6fhu0001dtfiwt1r8usc	57	837d77c5-d17b-45d9-9ee2-ce3e21054e6b-66	z-ai/glm-5-turbo	15798	2605	18403	0.0293776	2026-04-02T09:37:05.010Z	0
cmnh8b6jq000bcdlzchysm0ud	57	837d77c5-d17b-45d9-9ee2-ce3e21054e6b-66	z-ai/glm-5-turbo	11263	224	11487	0.0144116	2026-04-02T08:44:47.462Z	0
cmnh7l62z000110ddpkdvjm31	\N	837d77c5-d17b-45d9-9ee2-ce3e21054e6b-66	openai/gpt-4o	2337	132	2469	0.0071625	2026-04-02T08:24:33.803Z	0
cmnh7kxl60009cdlzxd2iewpg	57	837d77c5-d17b-45d9-9ee2-ce3e21054e6b-66	z-ai/glm-5-turbo	7883	1325	9208	0.0147596	2026-04-02T08:24:22.794Z	0
cmnh716l60001nyawl3h2u7uj	\N	837d77c5-d17b-45d9-9ee2-ce3e21054e6b-66	openai/gpt-4o	2298	95	2393	0.006695	2026-04-02T08:09:01.338Z	0
cmnh70zb00007cdlzs54s6pd4	57	837d77c5-d17b-45d9-9ee2-ce3e21054e6b-66	z-ai/glm-5-turbo	8312	423	8735	0.0116664	2026-04-02T08:08:51.900Z	0
cmnh6lqfu0005cdlz2z7544wi	57	837d77c5-d17b-45d9-9ee2-ce3e21054e6b-66	z-ai/glm-5-turbo	7043	1483	8526	0.0143836	2026-04-02T07:57:00.570Z	0
cmnh6e88v0001gr7mjp9dt3tg	\N	837d77c5-d17b-45d9-9ee2-ce3e21054e6b-66	openai/gpt-4o	1984	148	2132	0.00644	2026-04-02T07:51:10.399Z	0
cmnh6e0o70003cdlzmwh7u3wt	57	837d77c5-d17b-45d9-9ee2-ce3e21054e6b-66	z-ai/glm-5-turbo	5733	702	6435	0.0096876	2026-04-02T07:51:00.583Z	0
cmnh6ct830001cdlzm9e2wtfe	57	837d77c5-d17b-45d9-9ee2-ce3e21054e6b-66	z-ai/glm-5-turbo	4978	1001	5979	0.0099776	2026-04-02T07:50:04.275Z	0
cmnh1x5i70003joi7c086mvz0	\N	dbc5c9ad-efd7-48bb-9035-19049c05288c-56	openai/gpt-4o	1367	141	1508	0.0048275	2026-04-02T05:45:55.231Z	0
cmnh1x07d00034mwr4stzaogh	47	dbc5c9ad-efd7-48bb-9035-19049c05288c-56	z-ai/glm-5-turbo	5088	465	5553	0.0079656	2026-04-02T05:45:48.361Z	0
cmnh1ve3p00014mwrumpogojp	47	dbc5c9ad-efd7-48bb-9035-19049c05288c-56	z-ai/glm-5-turbo	6549	755	7304	0.0108788	2026-04-02T05:44:33.061Z	0
cmnh19ixn0001lpi3yj76x14f	\N	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	openai/gpt-4o	1466	117	1583	0.004835000000000001	2026-04-02T05:27:32.891Z	0
cmnh19bvb000jvmvwp1io9eri	47	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	z-ai/glm-5-turbo	9749	122	9871	0.0121868	2026-04-02T05:27:23.735Z	0
cmnh0yi5v0001c2xw9c1l5dzk	\N	c8c09c84-1d5e-4fae-86e3-5edd0d0e57a3-56	openai/gpt-4o	1437	147	1584	0.0050625	2026-04-02T05:18:58.675Z	0
cmnh0y9qm0005kyeej60tdfq3	47	c8c09c84-1d5e-4fae-86e3-5edd0d0e57a3-56	z-ai/glm-5-turbo	5721	1692	7413	0.0136332	2026-04-02T05:18:47.758Z	0
cmnh0x18i0001joi7ywj8q4o3	\N	c8c09c84-1d5e-4fae-86e3-5edd0d0e57a3-56	openai/gpt-4o	1157	122	1279	0.0041125	2026-04-02T05:17:50.082Z	0
cmnh0wtjb0003kyeepknrmuoo	47	c8c09c84-1d5e-4fae-86e3-5edd0d0e57a3-56	z-ai/glm-5-turbo	4921	836	5757	0.009249199999999999	2026-04-02T05:17:40.103Z	0
cmnoclckc0001oi2m4f37nvdd	43	fd3933de-e8cc-45e9-b167-cc6f84806e24-50	z-ai/glm-5-turbo	4378	80	4458	0.0055736	2026-04-07T08:19:03.516Z	0
cmnlyccke0003brr65pl1ynnk	47	c77a3012-4a19-4d62-a434-7704a13029bf-56	z-ai/glm-5-turbo	9268	566	9834	0.0133856	2026-04-05T16:04:36.638Z	0
cmnlx3d210001brr6ycncr9ir	47	c77a3012-4a19-4d62-a434-7704a13029bf-56	z-ai/glm-5-turbo	4380	58	4438	0.005488	2026-04-05T15:29:37.753Z	0
cmnlt6wf70001ie5ho1ku2gb7	\N	d480d79d-9f7a-498f-a835-429e734463be-58	openai/gpt-4o	1357	118	1475	0.0045725	2026-04-05T13:40:24.355Z	0
cmnlt6pq5000713f6gqxp8or3	49	d480d79d-9f7a-498f-a835-429e734463be-58	z-ai/glm-5-turbo	6177	92	6269	0.0077804	2026-04-05T13:40:15.677Z	0
cmnlt5lex0001p959ikubwuc0	\N	d480d79d-9f7a-498f-a835-429e734463be-58	openai/gpt-4o	1270	141	1411	0.004585000000000001	2026-04-05T13:39:23.433Z	0
cmngvpv3y0001i5jx7c1os2fi	\N	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	openai/gpt-4o	1536	130	1666	0.00514	2026-04-02T02:52:17.470Z	0
cmngvpmyw000bvmvw3234caxx	47	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	z-ai/glm-5-turbo	8502	848	9350	0.0135944	2026-04-02T02:52:06.920Z	0
cmngvo1s80001fp908yl4o7a3	\N	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	openai/gpt-4o	933	120	1053	0.0035325	2026-04-02T02:50:52.808Z	0
cmngvntyw0009vmvwhu9ng58r	47	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	z-ai/glm-5-turbo	7586	900	8486	0.0127032	2026-04-02T02:50:42.680Z	0
cmngvmt960001ou60mb6wd8k8	\N	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	openai/gpt-4o	1971	124	2095	0.0061675	2026-04-02T02:49:55.098Z	0
cmngvmlis0007vmvwu5m020rq	47	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	z-ai/glm-5-turbo	7351	267	7618	0.009889199999999999	2026-04-02T02:49:45.076Z	0
cmn336v4g0001gvjbfjiaas6y	47	88d192a1-7ac0-4bad-b9bf-864f02876cc6-56	z-ai/glm-5-turbo	5510	777	6287	0	2026-03-23T11:12:41.488Z	0
cmngvl7bt0001nlqx6yfp2qnm	\N	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	openai/gpt-4o	992	134	1126	0.00382	2026-04-02T02:48:40.025Z	0
cmngvkz2f0005vmvwrah37bo8	47	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	z-ai/glm-5-turbo	6282	1117	7399	0.0120064	2026-04-02T02:48:29.319Z	0
cmngvjrxv00038uyze45mft0h	\N	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	openai/gpt-4o	1658	156	1814	0.005705	2026-04-02T02:47:33.427Z	0
cmn336pcn0003uttyxhk1ov9i	133	0f321f84-eb82-4b03-9330-205b28cd377e-142	z-ai/glm-5-turbo	4615	169	4784	0	2026-03-23T11:12:34.007Z	0
cmn335ohy0001uttyzdmg1u9f	133	0f321f84-eb82-4b03-9330-205b28cd377e-142	z-ai/glm-5-turbo	4376	108	4484	0	2026-03-23T11:11:46.246Z	0
cmn3346110001q37r2hh1yjz2	47	2247b507-85d1-4e8e-b9ef-94978221b9f2-56	z-ai/glm-5-turbo	5150	976	6126	0	2026-03-23T11:10:35.653Z	0
cmngvjpwk00018uyzoj82dxg5	\N	ee8fd9f1-871b-4112-8e45-5b60615a624a-56	openai/gpt-4o	800	118	918	0.00318	2026-04-02T02:47:30.788Z	0
cmngvbcd30003vmvw2mbth9qs	47	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	z-ai/glm-5-turbo	5420	367	5787	0.007972	2026-04-02T02:40:59.991Z	0
cmngv882w0001vmvw0izztso3	47	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	z-ai/glm-5-turbo	2370	1062	3432	0.007091999999999999	2026-04-02T02:38:34.472Z	0
cmngv086c0007dw0847elo5uf	47	ee8fd9f1-871b-4112-8e45-5b60615a624a-56	z-ai/glm-5-turbo	6301	216	6517	0.008425199999999999	2026-04-02T02:32:21.348Z	0
cmn33256y000111sts305ylvz	\N	04d06483-fce0-4b61-a4bc-2b32db331a39	openai/gpt-4o	662	114	776	0.002795000000000001	2026-03-23T11:09:01.258Z	0
cmnguz2tg000347mzjamokmal	\N	ee8fd9f1-871b-4112-8e45-5b60615a624a-56	openai/gpt-4o	902	113	1015	0.003385	2026-04-02T02:31:27.748Z	0
cmn331y3a0007mhqhsm0m5r0s	47	f588b6d7-f122-4dd1-bfb3-483593eb566f-56	z-ai/glm-5-turbo	16897	629	17526	0	2026-03-23T11:08:52.054Z	0
cmnguyp2x000147mzksprzv39	\N	ee8fd9f1-871b-4112-8e45-5b60615a624a-56	openai/gpt-4o	929	143	1072	0.003752500000000001	2026-04-02T02:31:09.945Z	0
cmngutx2p0003dw082l381pts	47	ee8fd9f1-871b-4112-8e45-5b60615a624a-56	z-ai/glm-5-turbo	5866	513	6379	0.0090912	2026-04-02T02:27:27.025Z	0
cmnguo0aj0001cjvlfa8tj67x	\N	ee8fd9f1-871b-4112-8e45-5b60615a624a-56	openai/gpt-4o	870	135	1005	0.003525	2026-04-02T02:22:51.259Z	0
cmngunssf0001dw08qwnj0wlt	47	ee8fd9f1-871b-4112-8e45-5b60615a624a-56	z-ai/glm-5-turbo	5968	230	6198	0.0080816	2026-04-02T02:22:41.535Z	0
cmnguiyzo0001cwiy3ou4a0td	\N	ee8fd9f1-871b-4112-8e45-5b60615a624a-56	openai/gpt-4o	987	125	1112	0.0037175	2026-04-02T02:18:56.292Z	0
cmnguiqst00031068o0axy4ds	47	ee8fd9f1-871b-4112-8e45-5b60615a624a-56	z-ai/glm-5-turbo	4750	744	5494	0.008676	2026-04-02T02:18:45.677Z	0
cmnguhta600011068puu9je4f	47	ee8fd9f1-871b-4112-8e45-5b60615a624a-56	z-ai/glm-5-turbo	4414	346	4760	0.0066808	2026-04-02T02:18:02.238Z	0
cmngbejpq0001n2vxg710xacc	47	29d6b0b1-2605-45ed-90b4-d8d1c81cc6f2-56	z-ai/glm-5-turbo	4390	915	5305	0.008928	2026-04-01T17:23:37.166Z	0
cmn331x5y0003sqkxyjjz6m6y	133	04d06483-fce0-4b61-a4bc-2b32db331a39	z-ai/glm-5-turbo	4577	558	5135	0	2026-03-23T11:08:50.854Z	0
cmn330r300001sqkxsqt4wgq8	133	04d06483-fce0-4b61-a4bc-2b32db331a39	z-ai/glm-5-turbo	4378	204	4582	0	2026-03-23T11:07:56.316Z	0
cmn32zlba00019slzpc9z8ipu	\N	f588b6d7-f122-4dd1-bfb3-483593eb566f-56	openai/gpt-4o	833	107	940	0.0031525	2026-03-23T11:07:02.182Z	0
cmn32zdzk0005mhqhzpaf25qf	47	f588b6d7-f122-4dd1-bfb3-483593eb566f-56	z-ai/glm-5-turbo	15282	1695	16977	0	2026-03-23T11:06:52.688Z	0
cmn32x3jz00012lpq39fsm0za	\N	f588b6d7-f122-4dd1-bfb3-483593eb566f-56	openai/gpt-4o	848	109	957	0.00321	2026-03-23T11:05:05.855Z	0
cmn32wv4a0003mhqhrjym8mmm	47	f588b6d7-f122-4dd1-bfb3-483593eb566f-56	z-ai/glm-5-turbo	8585	298	8883	0	2026-03-23T11:04:54.922Z	0
cmn32vg1g0001mhqhd40bsnan	47	f588b6d7-f122-4dd1-bfb3-483593eb566f-56	z-ai/glm-5-turbo	7238	740	7978	0	2026-03-23T11:03:48.724Z	0
cmn324mlj00013rnxczv35ylp	\N	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	openai/gpt-4o	1459	129	1588	0.0049375	2026-03-23T10:42:57.511Z	0
cmn324eeb000honhuuhl4kugp	57	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	z-ai/glm-5-turbo	10371	515	10886	0	2026-03-23T10:42:46.883Z	0
cmn31plqn0001twc7p2moybh7	\N	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	openai/gpt-4o	1740	143	1883	0.00578	2026-03-23T10:31:16.559Z	0
cmn31pcn1000fonhu2z5wxu4i	57	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	z-ai/glm-5-turbo	9367	998	10365	0	2026-03-23T10:31:04.765Z	0
cmngwdz110001qrv0emf21v68	\N	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	openai/gpt-4o	1417	123	1540	0.004772500000000001	2026-04-02T03:11:02.293Z	0
cmngwdpsd000hvmvwczrj6t2o	47	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	z-ai/glm-5-turbo	11010	777	11787	0.01632	2026-04-02T03:10:50.317Z	0
cmngwbr2l0001maf4swvzspbe	\N	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	openai/gpt-4o	1541	115	1656	0.005002500000000001	2026-04-02T03:09:18.669Z	0
cmngwbj9l000fvmvw8dtda0g9	47	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	z-ai/glm-5-turbo	8192	759	8951	0.0128664	2026-04-02T03:09:08.553Z	0
cmngvvdff000113qjh64b34iw	\N	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	openai/gpt-4o	1498	116	1614	0.004905000000000001	2026-04-02T02:56:34.491Z	0
cmngvv62i000dvmvwi6exuemq	47	b2aec2c8-f216-4bc9-9bba-0b7ca219e087-56	z-ai/glm-5-turbo	9338	1031	10369	0.0153296	2026-04-02T02:56:24.954Z	0
cmn31ah600001ggihnrinblt9	\N	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	openai/gpt-4o	1357	120	1477	0.0045925	2026-03-23T10:19:30.792Z	0
cmn31a9uh0009dlu5tif4enje	131	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	z-ai/glm-5-turbo	6003	378	6381	0	2026-03-23T10:19:21.305Z	0
cmn317u240001ehl93b8ylk0i	\N	ab09cc93-6bf5-4405-96ad-8cf5475eb55c-3	openai/gpt-4o	2010	144	2154	0.006465000000000001	2026-03-23T10:17:27.532Z	0
cmn317lr8000bcntcon9okjd3	3	ab09cc93-6bf5-4405-96ad-8cf5475eb55c-3	z-ai/glm-5-turbo	7621	1971	9592	0	2026-03-23T10:17:16.772Z	0
cmn316h3e0005hkuptmvrf8ep	\N	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	openai/gpt-4o	1344	133	1477	0.00469	2026-03-23T10:16:24.074Z	0
cmn316bgv0003hkupb90m4l06	\N	ab09cc93-6bf5-4405-96ad-8cf5475eb55c-3	openai/gpt-4o	619	111	730	0.0026575	2026-03-23T10:16:16.783Z	0
cmn316a3g0009onhuf4nj7llc	57	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	z-ai/glm-5-turbo	6684	464	7148	0	2026-03-23T10:16:15.004Z	0
cmn31642n0009cntczmpu8jx4	3	ab09cc93-6bf5-4405-96ad-8cf5475eb55c-3	z-ai/glm-5-turbo	6100	1678	7778	0	2026-03-23T10:16:07.199Z	0
cmn315g1j0007cntchl4qk4b0	3	ab09cc93-6bf5-4405-96ad-8cf5475eb55c-3	z-ai/glm-5-turbo	5556	381	5937	0	2026-03-23T10:15:36.055Z	0
cmn3158si00011zubl1lk4zpz	\N	ab09cc93-6bf5-4405-96ad-8cf5475eb55c-3	openai/gpt-4o	800	125	925	0.00325	2026-03-23T10:15:26.658Z	0
cmn3151980005cntcojorhp18	3	ab09cc93-6bf5-4405-96ad-8cf5475eb55c-3	z-ai/glm-5-turbo	4942	337	5279	0	2026-03-23T10:15:16.892Z	0
cmn314gye0005o5x3z2szc0sd	\N	ab09cc93-6bf5-4405-96ad-8cf5475eb55c-3	openai/gpt-4o	520	104	624	0.00234	2026-03-23T10:14:50.582Z	0
cmn314em30003o5x34vpoiecx	\N	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	openai/gpt-4o	924	132	1056	0.00363	2026-03-23T10:14:47.547Z	0
cmn3147t80003cntcn4cc2j3a	3	ab09cc93-6bf5-4405-96ad-8cf5475eb55c-3	z-ai/glm-5-turbo	4627	349	4976	0	2026-03-23T10:14:38.732Z	0
cmn3147km0007onhun7lr22r5	57	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	z-ai/glm-5-turbo	5793	238	6031	0	2026-03-23T10:14:38.422Z	0
cmn313mz50005onhu5ywl1fb6	57	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	z-ai/glm-5-turbo	5656	157	5813	0	2026-03-23T10:14:11.729Z	0
cmn313ms10001cntcm2fh5ci6	3	ab09cc93-6bf5-4405-96ad-8cf5475eb55c-3	z-ai/glm-5-turbo	4405	162	4567	0	2026-03-23T10:14:11.473Z	0
cmn3132w600019q781kbfmbm6	\N	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	openai/gpt-4o	998	140	1138	0.003895	2026-03-23T10:13:45.702Z	0
cmn312vy30007dlu5eiohd0vx	131	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	z-ai/glm-5-turbo	5149	887	6036	0	2026-03-23T10:13:36.699Z	0
cmn31041q0001lvbgwuzpgqhk	\N	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	openai/gpt-4o	1106	152	1258	0.004285000000000001	2026-03-23T10:11:27.230Z	0
cmn30zvp20003onhuw7xr31ta	57	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	z-ai/glm-5-turbo	4975	429	5404	0	2026-03-23T10:11:16.406Z	0
cmn30xd9h000140thxteos64a	\N	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	openai/gpt-4o	600	115	715	0.00265	2026-03-23T10:09:19.205Z	0
cmn30x41l0005dlu50ehapjkv	131	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	z-ai/glm-5-turbo	4630	699	5329	0	2026-03-23T10:09:07.257Z	0
cmn30wbox00014bxu6gdt5bgw	\N	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	openai/gpt-4o	640	118	758	0.00278	2026-03-23T10:08:30.513Z	0
cmn30w6vi0001onhuomhh40od	57	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	z-ai/glm-5-turbo	4358	583	4941	0	2026-03-23T10:08:24.270Z	0
cmn30w3yr0003dlu56wx45q2x	131	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	z-ai/glm-5-turbo	4516	156	4672	0	2026-03-23T10:08:20.499Z	0
cmn30vcb80001dlu57h7wsqch	131	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	z-ai/glm-5-turbo	4341	169	4510	0	2026-03-23T10:07:44.660Z	0
cmn30szxv000117ximh402w48	21	df16699a-8dc9-46a1-a10f-1340ba8bc3f0-26	z-ai/glm-5-turbo	4345	1060	5405	0	2026-03-23T10:05:55.315Z	0
cmn30auhj0001z2h4hl7xdvxr	\N	9fef0e8a-1b6b-45ba-a328-1d159e547281-58	openai/gpt-4o	507	106	613	0.002327500000000001	2026-03-23T09:51:48.439Z	0
cmn30amqj000513m4yspi5mtt	49	9fef0e8a-1b6b-45ba-a328-1d159e547281-58	z-ai/glm-5-turbo	6213	746	6959	0	2026-03-23T09:51:38.395Z	0
cmn309chb00011hd101l6n2lc	\N	9fef0e8a-1b6b-45ba-a328-1d159e547281-58	openai/gpt-4o	572	134	706	0.00277	2026-03-23T09:50:38.447Z	0
cmn3094q6000313m40sxcv1u9	49	9fef0e8a-1b6b-45ba-a328-1d159e547281-58	z-ai/glm-5-turbo	6164	58	6222	0	2026-03-23T09:50:28.398Z	0
cmn3050s10001754m75er3b1a	\N	9fef0e8a-1b6b-45ba-a328-1d159e547281-58	openai/gpt-4o	1336	136	1472	0.0047	2026-03-23T09:47:16.657Z	0
cmn304swu000113m45qxnneid	49	9fef0e8a-1b6b-45ba-a328-1d159e547281-58	z-ai/glm-5-turbo	6043	134	6177	0	2026-03-23T09:47:06.462Z	0
cmn2zqa8v0001q4zfcsjr5x4m	\N	916d1193-4ef6-40c2-894f-b2feee2bcea0-43	openai/gpt-4o	1922	123	2045	0.006035	2026-03-23T09:35:49.087Z	0
cmn2zq2xh0005wz3k5tf1mqrf	36	916d1193-4ef6-40c2-894f-b2feee2bcea0-43	z-ai/glm-5-turbo	7038	265	7303	0	2026-03-23T09:35:39.605Z	0
cmn2zp4so0001psq198p1syq7	\N	916d1193-4ef6-40c2-894f-b2feee2bcea0-43	openai/gpt-4o	570	101	671	0.002435	2026-03-23T09:34:55.368Z	0
cmn2zoxbr0003wz3k3s7udzxz	36	916d1193-4ef6-40c2-894f-b2feee2bcea0-43	z-ai/glm-5-turbo	4848	1476	6324	0	2026-03-23T09:34:45.687Z	0
cmn2znku50001wz3k6i2el3u7	36	916d1193-4ef6-40c2-894f-b2feee2bcea0-43	z-ai/glm-5-turbo	4336	464	4800	0	2026-03-23T09:33:42.845Z	0
cmn31l0qv000donhu7l0ezfhg	57	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	z-ai/glm-5-turbo	8220	1489	9709	0	2026-03-23T10:27:42.727Z	0
cmn31i647000bonhuhdvn9b94	57	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	z-ai/glm-5-turbo	7263	812	8075	0	2026-03-23T10:25:29.719Z	0
cmn31ds500001mbkyi2wa6d8g	\N	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	openai/gpt-4o	977	146	1123	0.003902500000000001	2026-03-23T10:22:04.980Z	0
cmn31djea000ddlu5kx8259g8	131	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	z-ai/glm-5-turbo	6816	776	7592	0	2026-03-23T10:21:53.650Z	0
cmn31bms80001c1gonsb2uwqe	\N	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	openai/gpt-4o	808	134	942	0.00336	2026-03-23T10:20:24.728Z	0
cmn31begb000bdlu585b3cjjg	131	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	z-ai/glm-5-turbo	6309	752	7061	0	2026-03-23T10:20:13.931Z	0
cmn2y0plj0001k4xx72n2k49u	\N	f5e2f351-ffd8-4fef-857c-9130698a80eb-71	openai/gpt-4o	744	117	861	0.00303	2026-03-23T08:47:56.311Z	0
cmn2y0iif0007xxen3t6iptms	62	f5e2f351-ffd8-4fef-857c-9130698a80eb-71	z-ai/glm-5-turbo	5775	3101	8876	0	2026-03-23T08:47:47.127Z	0
cmn2xws050001xe5ocjmsshsd	\N	f5e2f351-ffd8-4fef-857c-9130698a80eb-71	openai/gpt-4o	615	103	718	0.0025675	2026-03-23T08:44:52.805Z	0
cmn2xwkkj0005xxenesmgwxz6	62	f5e2f351-ffd8-4fef-857c-9130698a80eb-71	z-ai/glm-5-turbo	5237	700	5937	0	2026-03-23T08:44:43.171Z	0
cmn2xvl6t00017ng7xwlq01ld	\N	f5e2f351-ffd8-4fef-857c-9130698a80eb-71	openai/gpt-4o	646	104	750	0.002655	2026-03-23T08:43:57.317Z	0
cmn2xvdw40003xxen3zz3n331	62	f5e2f351-ffd8-4fef-857c-9130698a80eb-71	z-ai/glm-5-turbo	4520	477	4997	0	2026-03-23T08:43:47.860Z	0
cmn2xuvd90001xxen11x8zlek	62	f5e2f351-ffd8-4fef-857c-9130698a80eb-71	z-ai/glm-5-turbo	4344	402	4746	0	2026-03-23T08:43:23.853Z	0
cmn2x8uqd0003dhu95kmxwk1x	62	018c716d-f5f1-4907-9142-92fb524119ee-71	z-ai/glm-5-turbo	4374	136	4510	0	2026-03-23T08:26:16.597Z	0
cmn2x817i0001dhu92sj51pkt	62	018c716d-f5f1-4907-9142-92fb524119ee-71	z-ai/glm-5-turbo	4333	70	4403	0	2026-03-23T08:25:38.334Z	0
cmn2x0e7p0005p86ptxr4eefm	62	79c2ae7a-3e73-4dc0-b123-8fb4665d1e14-71	z-ai/glm-5-turbo	5265	3992	9257	0	2026-03-23T08:19:41.941Z	0
cmn2wx2cq0001ly31xbl3g9xa	\N	79c2ae7a-3e73-4dc0-b123-8fb4665d1e14-71	openai/gpt-4o	1347	114	1461	0.0045075	2026-03-23T08:17:06.602Z	0
cmn2wwurk0003p86pxacng741	62	79c2ae7a-3e73-4dc0-b123-8fb4665d1e14-71	z-ai/glm-5-turbo	5221	90	5311	0	2026-03-23T08:16:56.768Z	0
cmn2wrsgb0001p86ptltctink	62	79c2ae7a-3e73-4dc0-b123-8fb4665d1e14-71	z-ai/glm-5-turbo	4336	1312	5648	0	2026-03-23T08:13:00.491Z	0
cmn2pjp6r0001klbspnw0jrgq	\N	0ba34e14-1ea3-42c4-86a6-404222d046fb-19	openai/gpt-4o	650	128	778	0.002905	2026-03-23T04:50:45.699Z	0
cmn2pjgyi0005t3lr0fzemf4c	15	0ba34e14-1ea3-42c4-86a6-404222d046fb-19	z-ai/glm-5-turbo	19554	2871	22425	0	2026-03-23T04:50:35.034Z	0
cmn2ph4yl0003t3lrdwfkvjcs	15	0ba34e14-1ea3-42c4-86a6-404222d046fb-19	z-ai/glm-5-turbo	6565	735	7300	0	2026-03-23T04:48:46.173Z	0
cmn2pe1wu0001t3lr6abvw93a	15	0ba34e14-1ea3-42c4-86a6-404222d046fb-19	z-ai/glm-5-turbo	5959	674	6633	0	2026-03-23T04:46:22.254Z	0
cmn2pbpa20001g53yum99b1o3	15	56849a2d-a2f7-4310-b8c9-288f9a92b5dd-19	z-ai/glm-5-turbo	5927	520	6447	0	2026-03-23T04:44:32.570Z	0
cmn2p9jon0001fwjdpnv5uee5	\N	0431038e-7060-433d-899b-55db1fc5c064	openai/gpt-4o	4788	134	4922	0.01331	2026-03-23T04:42:52.007Z	0
cmn2p9bpr000d1bkn0sqfg4v1	15	0431038e-7060-433d-899b-55db1fc5c064	z-ai/glm-5-turbo	57344	3636	60980	0	2026-03-23T04:42:41.679Z	0
cmn2p1fuc0001n72aunbcw2wn	\N	0431038e-7060-433d-899b-55db1fc5c064	openai/gpt-4o	4825	157	4982	0.0136325	2026-03-23T04:36:33.780Z	0
cmn2p18b4000b1bknurj3notl	15	0431038e-7060-433d-899b-55db1fc5c064	z-ai/glm-5-turbo	53780	8273	62053	0	2026-03-23T04:36:24.016Z	0
cmn2onpng0001mtflz35igvb2	\N	0431038e-7060-433d-899b-55db1fc5c064	openai/gpt-4o	2487	120	2607	0.0074175	2026-03-23T04:25:53.308Z	0
cmn2oni8i00091bknajk2ks0q	15	0431038e-7060-433d-899b-55db1fc5c064	z-ai/glm-5-turbo	38860	6275	45135	0	2026-03-23T04:25:43.698Z	0
cmn2ok75b000167w5lbeyozug	\N	0431038e-7060-433d-899b-55db1fc5c064	openai/gpt-4o	2392	127	2519	0.00725	2026-03-23T04:23:09.359Z	0
cmn2ojzl700071bknbkoa0k08	15	0431038e-7060-433d-899b-55db1fc5c064	z-ai/glm-5-turbo	31726	2029	33755	0	2026-03-23T04:22:59.563Z	0
cmn2ohsl00001tjphdywptyyb	130	84408faa-9650-49d8-88a3-83b0711067a0	z-ai/glm-5-turbo	4336	56	4392	0	2026-03-23T04:21:17.172Z	0
cmn2o0x030001103d1sbt171u	\N	0aaecaa2-8011-411a-b87a-ad5431d9a5b1	openai/gpt-4o	845	135	980	0.0034625	2026-03-23T04:08:09.747Z	0
cmn2o0t2f00051bkngijvdbl1	15	0431038e-7060-433d-899b-55db1fc5c064	z-ai/glm-5-turbo	28691	1924	30615	0	2026-03-23T04:08:04.647Z	0
cmn2o0pvl0005dtttg3ytn2sj	48	0aaecaa2-8011-411a-b87a-ad5431d9a5b1	z-ai/glm-5-turbo	16153	1218	17371	0	2026-03-23T04:08:00.513Z	0
cmn2nxmko0001hss4l1hnhlsw	\N	3c3ed450-601c-4a55-96a8-92a2c901d53c-26	openai/gpt-4o	526	106	632	0.002375	2026-03-23T04:05:36.264Z	0
cmn2nxfoz00057trwuzgs8ka2	21	3c3ed450-601c-4a55-96a8-92a2c901d53c-26	z-ai/glm-5-turbo	14215	3612	17827	0	2026-03-23T04:05:27.347Z	0
cmn2nwa2b00037trwdf9w5zdg	21	3c3ed450-601c-4a55-96a8-92a2c901d53c-26	z-ai/glm-5-turbo	8014	98	8112	0	2026-03-23T04:04:33.395Z	0
cmn2nvmdp00017trwqiud2lla	21	3c3ed450-601c-4a55-96a8-92a2c901d53c-26	z-ai/glm-5-turbo	4331	138	4469	0	2026-03-23T04:04:02.701Z	0
cmn2nqc9200019bsbqb7r41qy	\N	0aaecaa2-8011-411a-b87a-ad5431d9a5b1	openai/gpt-4o	1465	137	1602	0.005032500000000001	2026-03-23T03:59:56.294Z	0
cmn2nq5ea0003dtttg1a3oh9b	48	0aaecaa2-8011-411a-b87a-ad5431d9a5b1	z-ai/glm-5-turbo	11819	783	12602	0	2026-03-23T03:59:47.410Z	0
cmn2noo0k0001cwgsg5duus0i	\N	0431038e-7060-433d-899b-55db1fc5c064	openai/gpt-4o	1134	124	1258	0.004075	2026-03-23T03:58:38.228Z	0
cmn2nogmo00031bkng3jq5aea	15	0431038e-7060-433d-899b-55db1fc5c064	z-ai/glm-5-turbo	16345	1397	17742	0	2026-03-23T03:58:28.656Z	0
cmn2nli0r0001b841admpd9oz	49	f5a55758-43e9-4ceb-a5d4-b8850a12033a-58	z-ai/glm-5-turbo	5997	316	6313	0	2026-03-23T03:56:10.491Z	0
cmn2ygfuo0003awpub23l1s3q	62	f5e2f351-ffd8-4fef-857c-9130698a80eb-71	z-ai/glm-5-turbo	9076	5493	14569	0	2026-03-23T09:00:10.176Z	0
cmn2yevgf0001t2r521h6n1lj	\N	f5e2f351-ffd8-4fef-857c-9130698a80eb-71	openai/gpt-4o	3510	143	3653	0.010205	2026-03-23T08:58:57.087Z	0
cmn2yenwo0001awpum82p33ah	62	f5e2f351-ffd8-4fef-857c-9130698a80eb-71	z-ai/glm-5-turbo	8728	259	8987	0	2026-03-23T08:58:47.304Z	0
cmn2ycyun0001o5x3x0afw6ca	\N	3e133a3b-be03-428a-9587-bd4dbf0d77dc-3	openai/gpt-4o	535	106	641	0.0023975	2026-03-23T08:57:28.175Z	0
cmn2ycr2f0003102brj9cfggt	3	3e133a3b-be03-428a-9587-bd4dbf0d77dc-3	z-ai/glm-5-turbo	4977	139	5116	0	2026-03-23T08:57:18.087Z	0
cmn2ybe1t0001102bto8zeuww	3	3e133a3b-be03-428a-9587-bd4dbf0d77dc-3	z-ai/glm-5-turbo	4335	92	4427	0	2026-03-23T08:56:14.561Z	0
cmn2n6swj000311q3jeew6pjw	29	c965ee4e-bcb2-479e-889b-ec76b9d9ee6b-36	z-ai/glm-5-turbo	18504	2610	21114	0	2026-03-23T03:44:44.755Z	0
cmn2n5fdh000111q3izm5721t	29	c965ee4e-bcb2-479e-889b-ec76b9d9ee6b-36	z-ai/glm-5-turbo	5922	544	6466	0	2026-03-23T03:43:40.565Z	0
cmn2n59t70001hnw8m6rne8mn	29	2534212c-da25-493c-8776-02dc375ad7e3-36	z-ai/glm-5-turbo	4888	166	5054	0	2026-03-23T03:43:33.355Z	0
cmn2mxxa20001l1ssocjc6ez1	127	60d5d94c-a0f7-4788-860e-0933f93ff1b7	anthropic/claude-haiku-4.5	5337	213	5550	0.0051216	2026-03-23T03:37:50.522Z	0
cmn2mws540001vbml7c5tckff	127	45621c02-2bf0-4af9-ae64-e343579c235c	anthropic/claude-haiku-4.5	5335	56	5391	0.004492	2026-03-23T03:36:57.208Z	0
cmn2mwbo40001856g4hp61mpo	29	6521f34a-9c8c-45a6-bbb3-294350524224-36	anthropic/claude-haiku-4.5	5374	423	5797	0.005991199999999999	2026-03-23T03:36:35.860Z	0
cmn2mtm280001455i1sdzzd82	29	77e6dffc-73fa-4456-9071-28fe1161c1d2-36	anthropic/claude-haiku-4.5	5374	344	5718	0.005675199999999999	2026-03-23T03:34:29.360Z	0
cmn2mt1av00012wvwm3ki8twj	29	595d7c8c-23a4-4ae5-9408-1b162dc76830-36	anthropic/claude-haiku-4.5	7289	650	7939	0.0084312	2026-03-23T03:34:02.455Z	0
cmn2mshml000171qdg05rolow	29	c9f371c4-4b57-489a-b7c3-ffd1b7e93807-36	anthropic/claude-haiku-4.5	5343	432	5775	0.0060024	2026-03-23T03:33:36.957Z	0
cmn2ms6yr00018bz8zu80xf7s	\N	2ecdb509-b5b9-4553-9fa0-fab548397074-9	openai/gpt-4o	579	116	695	0.0026075	2026-03-23T03:33:23.139Z	0
cmn2mrzmq000310ojeqbvx85t	6	2ecdb509-b5b9-4553-9fa0-fab548397074-9	anthropic/claude-haiku-4.5	5563	298	5861	0.005642400000000001	2026-03-23T03:33:13.634Z	0
cmn2mrovt000110oj4rila4kt	6	2ecdb509-b5b9-4553-9fa0-fab548397074-9	anthropic/claude-haiku-4.5	5333	187	5520	0.0050144	2026-03-23T03:32:59.705Z	0
cmn2mqyx50001zbf5wxpce67h	\N	a2825cd4-5e41-42f0-9d29-dd0666789f4b-9	openai/gpt-4o	604	110	714	0.00261	2026-03-23T03:32:26.057Z	0
cmn2mqbf70001o5kupo7vf8ex	6	a2825cd4-5e41-42f0-9d29-dd0666789f4b-9	anthropic/claude-haiku-4.5	5333	227	5560	0.0051744	2026-03-23T03:31:55.603Z	0
cmn2mpmb60001219dlmxktjq8	\N	b745c403-bc8d-49e7-9d70-c6a11efc2aae-9	openai/gpt-4o	483	103	586	0.0022375	2026-03-23T03:31:23.058Z	0
cmn2mperf00051m98qa61j7vj	6	b745c403-bc8d-49e7-9d70-c6a11efc2aae-9	anthropic/claude-haiku-4.5	17799	2642	20441	0.0248072	2026-03-23T03:31:13.275Z	0
cmn2moi5e0001rhwgh0qyf1ow	\N	b745c403-bc8d-49e7-9d70-c6a11efc2aae-9	openai/gpt-4o	497	121	618	0.0024525	2026-03-23T03:30:31.010Z	0
cmn2moc6o00031m98sxyt26xa	6	b745c403-bc8d-49e7-9d70-c6a11efc2aae-9	anthropic/claude-haiku-4.5	8047	290	8337	0.007597599999999999	2026-03-23T03:30:23.280Z	0
cmn2mnsjt00011m985texbd0o	6	b745c403-bc8d-49e7-9d70-c6a11efc2aae-9	anthropic/claude-haiku-4.5	5333	470	5803	0.0061464	2026-03-23T03:29:57.833Z	0
cmn2mif000001g09iqjf7crpm	\N	db5ed3ea-86b3-4465-9058-9b51dad5451d-36	openai/gpt-4o	575	114	689	0.0025775	2026-03-23T03:25:46.992Z	0
cmn2mi6zp0003qy28vx6es9wt	29	db5ed3ea-86b3-4465-9058-9b51dad5451d-36	anthropic/claude-haiku-4.5	9737	1475	11212	0.0136896	2026-03-23T03:25:36.613Z	0
cmn2mhe2d00019szshor96qvk	47	b24e0bbf-57ca-46dc-85ef-df1416234df6-56	anthropic/claude-haiku-4.5	10144	754	10898	0.0111312	2026-03-23T03:24:59.125Z	0
cmn2mglf8000125jp5zu6sjhp	29	efecc16b-2c54-4cbf-8e8a-7a45beb82776-36	anthropic/claude-haiku-4.5	5982	206	6188	0.0056096	2026-03-23T03:24:22.004Z	0
cmn2mgcg70001qy280qzrc79m	29	db5ed3ea-86b3-4465-9058-9b51dad5451d-36	anthropic/claude-haiku-4.5	5343	438	5781	0.006026399999999999	2026-03-23T03:24:10.375Z	0
cmn2mdmq50001bcpm5dx4kghs	125	07bb2e42-ea01-4a64-a395-e2da4ff3a3d9	qwen/qwen3.5-35b-a3b	6932	659	7591	0	2026-03-23T03:22:03.725Z	0
cmn2mde8n00019tlx0i8w4nhs	\N	71b20744-3702-4a1e-9b14-a9a581e3944c-56	openai/gpt-4o	610	120	730	0.002725	2026-03-23T03:21:52.727Z	0
cmn2md7ac00038a768ip57gsv	47	71b20744-3702-4a1e-9b14-a9a581e3944c-56	qwen/qwen3.5-35b-a3b	7114	417	7531	0	2026-03-23T03:21:43.716Z	0
cmn2mcmhe00017hvi50euv3g0	29	f00a0bb8-83d0-4161-83d5-a63a0cccc2d6-36	qwen/qwen3.5-35b-a3b	8677	237	8914	0	2026-03-23T03:21:16.754Z	0
cmn2mcced00018a76lb5p6s47	47	71b20744-3702-4a1e-9b14-a9a581e3944c-56	qwen/qwen3.5-35b-a3b	4711	127	4838	0	2026-03-23T03:21:03.685Z	0
cmn2mcagu00017ibzbkavpwve	\N	fe325490-95d1-487c-8611-40b8ab26a5af-36	openai/gpt-4o	606	110	716	0.002615	2026-03-23T03:21:01.182Z	0
cmn2mc2vs0003ftvfquabdg6z	29	fe325490-95d1-487c-8611-40b8ab26a5af-36	qwen/qwen3.5-35b-a3b	7166	351	7517	0	2026-03-23T03:20:51.352Z	0
cmn2mb4zp0001ftvf2evcuyzr	29	fe325490-95d1-487c-8611-40b8ab26a5af-36	qwen/qwen3.5-35b-a3b	5544	144	5688	0	2026-03-23T03:20:07.429Z	0
cmn2luoxg0001x3r7ypfresd2	\N	6ccdda02-b166-4fa9-8830-2808d7ce67ed	openai/gpt-4o	972	132	1104	0.003750000000000001	2026-03-23T03:07:20.116Z	0
cmn2luh5d000b10db6iktkfbl	20	6ccdda02-b166-4fa9-8830-2808d7ce67ed	z-ai/glm-5-turbo	17080	2241	19321	0	2026-03-23T03:07:10.033Z	0
cmn2lsqey000128jsrlloapp2	\N	6ccdda02-b166-4fa9-8830-2808d7ce67ed	openai/gpt-4o	1019	127	1146	0.003817500000000001	2026-03-23T03:05:48.730Z	0
cmn2lsirg000910db8uap0unv	20	6ccdda02-b166-4fa9-8830-2808d7ce67ed	z-ai/glm-5-turbo	16593	2081	18674	0	2026-03-23T03:05:38.812Z	0
cmn2lf5ve0001zcnx6ebbjqgl	\N	809b944c-6e43-465b-8860-a25071d58d1e-25	openai/gpt-4o	833	134	967	0.0034225	2026-03-23T02:55:15.578Z	0
cmn2lez2c00036z59pmpftllu	20	809b944c-6e43-465b-8860-a25071d58d1e-25	z-ai/glm-5-turbo	16713	1797	18510	0	2026-03-23T02:55:06.756Z	0
cmn2nk7v400011bknjj23nds6	15	0431038e-7060-433d-899b-55db1fc5c064	z-ai/glm-5-turbo	8465	1308	9773	0	2026-03-23T03:55:10.672Z	0
cmn2nehsz0003e7a2idrck5li	29	55acf264-37e4-4b2c-836f-83a3c97f96ff	z-ai/glm-5-turbo	10455	1464	11919	0	2026-03-23T03:50:43.619Z	0
cmn2nckm50001kfn2hm2epilc	15	e73b19cd-3516-4776-8250-5dc39a474586	z-ai/glm-5-turbo	7722	576	8298	0	2026-03-23T03:49:13.949Z	0
cmn2nbd9y0001e7a2rxwjvaz3	29	55acf264-37e4-4b2c-836f-83a3c97f96ff	z-ai/glm-5-turbo	6425	563	6988	0	2026-03-23T03:48:17.782Z	0
cmn2n7w0o0001cjmnetvg66hl	29	79fe2b49-d22f-4e05-8859-cc8cf499d86a-36	z-ai/glm-5-turbo	6418	493	6911	0	2026-03-23T03:45:35.448Z	0
cmn2n70e2000112aru8oixkge	\N	c965ee4e-bcb2-479e-889b-ec76b9d9ee6b-36	openai/gpt-4o	603	126	729	0.0027675	2026-03-23T03:44:54.458Z	0
cmn2l591i000122aigl5urxu8	\N	6ccdda02-b166-4fa9-8830-2808d7ce67ed	openai/gpt-4o	873	150	1023	0.0036825	2026-03-23T02:47:33.126Z	0
cmn2l516h000310db86q8je69	20	6ccdda02-b166-4fa9-8830-2808d7ce67ed	z-ai/glm-5-turbo	13163	1704	14867	0	2026-03-23T02:47:22.937Z	0
cmn2l2dw20001snf8ds8yzar7	29	5f307038-cfcd-4581-8b86-715eb655b90f-36	z-ai/glm-5-turbo	4332	65	4397	0	2026-03-23T02:45:19.442Z	0
cmn2l1z6c000110db0qq820bu	20	6ccdda02-b166-4fa9-8830-2808d7ce67ed	z-ai/glm-5-turbo	9303	1240	10543	0	2026-03-23T02:45:00.372Z	0
cmn2l0lgs000110i4d15z1hmh	6	97358d7d-9d82-4540-b2eb-46617dc820b9-9	z-ai/glm-5-turbo	4331	165	4496	0	2026-03-23T02:43:55.948Z	0
cmn2kuohr0001132zjprwjbqo	\N	80b47a8c-53b7-4a0d-9284-da156e36f534-9	openai/gpt-4o	647	117	764	0.0027875	2026-03-23T02:39:19.935Z	0
cmn2kudcj0005oyga0la0yax2	6	80b47a8c-53b7-4a0d-9284-da156e36f534-9	z-ai/glm-5-turbo	18924	2869	21793	0	2026-03-23T02:39:05.491Z	0
cmn2kq7320001rsgz9nrrf20v	\N	80b47a8c-53b7-4a0d-9284-da156e36f534-9	openai/gpt-4o	591	116	707	0.0026375	2026-03-23T02:35:50.750Z	0
cmn2kq0900003oygamgaahvm6	6	80b47a8c-53b7-4a0d-9284-da156e36f534-9	z-ai/glm-5-turbo	6057	480	6537	0	2026-03-23T02:35:41.892Z	0
cmn2knpfj0001oyga58usla5x	6	80b47a8c-53b7-4a0d-9284-da156e36f534-9	z-ai/glm-5-turbo	4333	152	4485	0	2026-03-23T02:33:54.559Z	0
cmn2kn7xr00015fqho7r0dgsp	\N	2f36a3c1-74c3-4573-9374-a180a2b91c98-9	openai/gpt-4o	595	119	714	0.0026775	2026-03-23T02:33:31.887Z	0
cmn2kmzqo0001n3j6flscm5dc	6	2f36a3c1-74c3-4573-9374-a180a2b91c98-9	z-ai/glm-5-turbo	4470	44	4514	0	2026-03-23T02:33:21.264Z	0
cmn2kk3nw00018btsyziaa72a	6	2f36a3c1-74c3-4573-9374-a180a2b91c98-9	anthropic/claude-haiku-4.5	5333	210	5543	0.0051064	2026-03-23T02:31:06.380Z	0
cmn2jvwlg0001z84cstohgo8n	49	8d44436c-469f-4419-a85e-52d1bb6b8414-58	anthropic/claude-haiku-4.5	5364	504	5868	0.006307200000000001	2026-03-23T02:12:17.476Z	0
cmn2jitwf00017op1jmz78ao2	3	1da3d165-1802-40bd-8ab0-c56b8c335698	anthropic/claude-haiku-4.5	5353	79	5432	0.0045984	2026-03-23T02:02:07.455Z	0
cmn2j91aq0001hi5ecdpeeckp	57	1a78ee51-edd0-40e3-9d0d-6fa16a0c9caa-66	anthropic/claude-haiku-4.5	7533	700	8233	0.0088264	2026-03-23T01:54:30.482Z	0
cmn2iz80h0003kqtn6xidro9b	21	511b81ee-be21-465a-af7e-26f073e501b7-26	anthropic/claude-haiku-4.5	5586	226	5812	0.0053728	2026-03-23T01:46:52.625Z	0
cmn2iys880001kqtna0u8z4n0	21	511b81ee-be21-465a-af7e-26f073e501b7-26	anthropic/claude-haiku-4.5	5330	213	5543	0.005116	2026-03-23T01:46:32.168Z	0
cmn27oek0000110dv0zyb9dsj	49	43a3f5ed-8a42-4e85-b731-7cb2fbef3555	anthropic/claude-haiku-4.5	5151	70	5221	0.0044008	2026-03-22T20:30:32.112Z	0
cmn1n5psp000185qxsd9s80ra	121	68de2687-9860-4a2b-86c3-cb2fc98a2a7b	anthropic/claude-haiku-4.5	5717	306	6023	0.0057976	2026-03-22T10:56:07.897Z	0
cmn1mv98p00012aq8r6c7298p	\N	3de3e7ef-b8eb-4de6-9b77-f94fbcb145e1	openai/gpt-4o	598	113	711	0.002625	2026-03-22T10:47:59.881Z	0
cmn1mv2gf0003oh0fyq7wuxs1	121	3de3e7ef-b8eb-4de6-9b77-f94fbcb145e1	anthropic/claude-haiku-4.5	5388	31	5419	0.0044344	2026-03-22T10:47:51.087Z	0
cmn1mumcs0001oh0fep373xgo	121	3de3e7ef-b8eb-4de6-9b77-f94fbcb145e1	anthropic/claude-haiku-4.5	5158	200	5358	0.004926399999999999	2026-03-22T10:47:30.220Z	0
cmn0wfu4g0001lnbfxotnc8pn	\N	c54bc51d-180d-4e1d-8b3f-91800a54885d	openai/gpt-4o	540	109	649	0.00244	2026-03-21T22:28:10.432Z	0
cmn0wfmyk000311k7rp5ma7h9	3	c54bc51d-180d-4e1d-8b3f-91800a54885d	anthropic/claude-haiku-4.5	5311	98	5409	0.0046408	2026-03-21T22:28:01.148Z	0
cmn0weoli000111k7pa6nwz2x	3	c54bc51d-180d-4e1d-8b3f-91800a54885d	anthropic/claude-haiku-4.5	5158	141	5299	0.0046904	2026-03-21T22:27:16.614Z	0
cmn099g5q0001yg6iwre4us4z	3	75bd50bf-bd4a-4f28-8a20-ed3136b89bcc-3	anthropic/claude-haiku-4.5	5168	224	5392	0.0050304	2026-03-21T11:39:21.230Z	0
cmmzv92510001dxajuwx3lc11	\N	ae8aca03-e728-43c2-ba86-45e270a6f2c5-56	openai/gpt-4o	663	108	771	0.0027375	2026-03-21T05:07:08.437Z	0
cmmzv8ucm00036qn985mnhs0g	47	ae8aca03-e728-43c2-ba86-45e270a6f2c5-56	anthropic/claude-haiku-4.5	6704	4096	10800	0.0217472	2026-03-21T05:06:58.342Z	0
cmmzv7b3y00016qn93o82oqk9	47	ae8aca03-e728-43c2-ba86-45e270a6f2c5-56	anthropic/claude-haiku-4.5	5884	394	6278	0.0062832	2026-03-21T05:05:46.750Z	0
cmmzrwin80001lrfx10qidrve	47	163ca6ab-7546-4189-aa82-c94d9b183977-56	anthropic/claude-haiku-4.5	12722	1526	14248	0.0162816	2026-03-21T03:33:24.452Z	0
cmmysg9yf0001bmyl5eupgsfr	\N	80d84a46-b39b-446e-946e-aa43d79757c6-25	openai/gpt-4o	701	130	831	0.003052500000000001	2026-03-20T11:01:00.135Z	0
cmmysg1wn000713bpo64rjdw3	20	80d84a46-b39b-446e-946e-aa43d79757c6-25	anthropic/claude-haiku-4.5	6989	870	7859	0.0090712	2026-03-20T11:00:49.703Z	0
cmmysc27k0001dt74b14qdee1	\N	80d84a46-b39b-446e-946e-aa43d79757c6-25	openai/gpt-4o	683	129	812	0.0029975	2026-03-20T10:57:43.472Z	0
cmmysbuow000513bpkugpmxwp	20	80d84a46-b39b-446e-946e-aa43d79757c6-25	anthropic/claude-haiku-4.5	6078	411	6489	0.006506399999999999	2026-03-20T10:57:33.728Z	0
cmmysbm7j0001wr53wv41tkf9	\N	80d84a46-b39b-446e-946e-aa43d79757c6-25	openai/gpt-4o	783	145	928	0.0034075	2026-03-20T10:57:22.735Z	0
cmmysbea7000313bprkshx4l7	20	80d84a46-b39b-446e-946e-aa43d79757c6-25	anthropic/claude-haiku-4.5	5710	357	6067	0.005996	2026-03-20T10:57:12.463Z	0
cmmysay17000113bp4hx66bmj	20	80d84a46-b39b-446e-946e-aa43d79757c6-25	anthropic/claude-haiku-4.5	5162	532	5694	0.0062576	2026-03-20T10:56:51.403Z	0
cmn2l9mqy00019enxm400flvd	20	19c474b2-fd7d-408f-a9cc-ce50e8dcd29a-25	z-ai/glm-5-turbo	8214	811	9025	0	2026-03-23T02:50:57.514Z	0
cmn2l8jzk0001h1smfos6642b	\N	6ccdda02-b166-4fa9-8830-2808d7ce67ed	openai/gpt-4o	2080	115	2195	0.006350000000000001	2026-03-23T02:50:07.280Z	0
cmn2l8dop000710dbjkjwj72g	20	6ccdda02-b166-4fa9-8830-2808d7ce67ed	z-ai/glm-5-turbo	16052	573	16625	0	2026-03-23T02:49:59.113Z	0
cmn2l7oxi0001dj4419q4vier	\N	6ccdda02-b166-4fa9-8830-2808d7ce67ed	openai/gpt-4o	2435	124	2559	0.007327500000000001	2026-03-23T02:49:27.030Z	0
cmn2l7gr7000510db7mt9rv6g	20	6ccdda02-b166-4fa9-8830-2808d7ce67ed	z-ai/glm-5-turbo	14451	1953	16404	0	2026-03-23T02:49:16.435Z	0
cmn2l6nsb0001iad0dml9p521	6	ecf6493d-6858-4c22-92fb-2a18fcae034d-9	z-ai/glm-5-turbo	4333	158	4491	0	2026-03-23T02:48:38.891Z	0
cmmyp478g0001su290f4emjv9	\N	237771fd-3353-4588-a656-daeec712d4b6-58	openai/gpt-4o	633	120	753	0.0027825	2026-03-20T09:27:37.888Z	0
cmmyp3xv60005ybz2z08oe1gk	49	237771fd-3353-4588-a656-daeec712d4b6-58	anthropic/claude-haiku-4.5	6009	153	6162	0.0054192	2026-03-20T09:27:25.746Z	0
cmmyokpxc00016xpwolplad5q	\N	237771fd-3353-4588-a656-daeec712d4b6-58	openai/gpt-4o	534	129	663	0.002625	2026-03-20T09:12:28.992Z	0
cmmyokhpw0003ybz2ouqr1th7	49	237771fd-3353-4588-a656-daeec712d4b6-58	anthropic/claude-haiku-4.5	5863	137	6000	0.0052384	2026-03-20T09:12:18.356Z	0
cmmyo9uxg0007abar9ahvjplk	\N	18771776-6adf-40b0-bbce-1d83e4a2d019	openai/gpt-4o	545	113	658	0.0024925	2026-03-20T09:04:02.260Z	0
cmmynutlt00074827zkot8v3q	49	16932e87-63ca-4c1c-a679-2584eeabbbac-58	anthropic/claude-haiku-4.5	5895	240	6135	0.005676	2026-03-20T08:52:20.705Z	0
cmmynuekl000jfwdpns6ycwle	\N	16932e87-63ca-4c1c-a679-2584eeabbbac-58	openai/gpt-4o	572	127	699	0.0027	2026-03-20T08:52:01.221Z	0
cmmynu7x300054827bmcfeydj	49	16932e87-63ca-4c1c-a679-2584eeabbbac-58	anthropic/claude-haiku-4.5	5468	275	5743	0.005474399999999999	2026-03-20T08:51:52.599Z	0
cmmyntyzs0005abar3syzwpf6	\N	16932e87-63ca-4c1c-a679-2584eeabbbac-58	openai/gpt-4o	561	113	674	0.0025325	2026-03-20T08:51:41.032Z	0
cmmyntt12000348270msa41ok	49	16932e87-63ca-4c1c-a679-2584eeabbbac-58	anthropic/claude-haiku-4.5	5364	100	5464	0.0046912	2026-03-20T08:51:33.302Z	0
cmmynracn000148272bbxn5dy	49	16932e87-63ca-4c1c-a679-2584eeabbbac-58	anthropic/claude-haiku-4.5	5156	108	5264	0.0045568	2026-03-20T08:49:35.783Z	0
cmmynqenp0003abar1b6zf2g7	\N	53760db8-7da5-4a2f-abf7-76c9578aff4e-58	openai/gpt-4o	523	126	649	0.0025675	2026-03-20T08:48:54.709Z	0
cmmynqe78000790tbnmfo7gvb	118	18771776-6adf-40b0-bbce-1d83e4a2d019	anthropic/claude-haiku-4.5	7285	662	7947	0.008476	2026-03-20T08:48:54.116Z	0
cmmynq9840001nkwxani5yynp	\N	53760db8-7da5-4a2f-abf7-76c9578aff4e-58	openai/gpt-4o	516	95	611	0.00224	2026-03-20T08:48:47.668Z	0
cmmynq8ix0005mnegzk3eacsr	49	53760db8-7da5-4a2f-abf7-76c9578aff4e-58	anthropic/claude-haiku-4.5	5661	44	5705	0.004704799999999999	2026-03-20T08:48:46.761Z	0
cmmynq4ei0001abar53e2tsz7	\N	18771776-6adf-40b0-bbce-1d83e4a2d019	openai/gpt-4o	533	137	670	0.0027025	2026-03-20T08:48:41.418Z	0
cmmynq2160003mnegieteeqt6	49	53760db8-7da5-4a2f-abf7-76c9578aff4e-58	anthropic/claude-haiku-4.5	5220	256	5476	0.0052	2026-03-20T08:48:38.346Z	0
cmmynpwqr000590tbtooy9cfq	118	18771776-6adf-40b0-bbce-1d83e4a2d019	anthropic/claude-haiku-4.5	6939	200	7139	0.0063512	2026-03-20T08:48:31.491Z	0
cmmynphtu0001mnegk690s7dw	49	53760db8-7da5-4a2f-abf7-76c9578aff4e-58	anthropic/claude-haiku-4.5	5154	59	5213	0.0043592	2026-03-20T08:48:12.162Z	0
cmmynp0lv000hfwdphmdqnduq	\N	18771776-6adf-40b0-bbce-1d83e4a2d019	openai/gpt-4o	518	126	644	0.002555	2026-03-20T08:47:49.843Z	0
cmmynota1000390tbpt2gzb5i	118	18771776-6adf-40b0-bbce-1d83e4a2d019	anthropic/claude-haiku-4.5	6492	243	6735	0.006165599999999999	2026-03-20T08:47:40.345Z	0
cmmynonxt000190tbzng37vsi	118	18771776-6adf-40b0-bbce-1d83e4a2d019	anthropic/claude-haiku-4.5	6167	208	6375	0.0057656	2026-03-20T08:47:33.425Z	0
cmmyno7j2000ffwdpay1n6wio	\N	64670b34-c9d2-406d-a580-a22d019bb6ee-25	openai/gpt-4o	1775	129	1904	0.005727500000000001	2026-03-20T08:47:12.158Z	0
cmmyno1o4000npftxigzhu7mt	20	64670b34-c9d2-406d-a580-a22d019bb6ee-25	anthropic/claude-haiku-4.5	64528	6144	70672	0.0761984	2026-03-20T08:47:04.564Z	0
cmmynns7s000dfwdpral50quv	\N	64670b34-c9d2-406d-a580-a22d019bb6ee-25	openai/gpt-4o	1981	149	2130	0.0064425	2026-03-20T08:46:52.312Z	0
cmmynm472000feoz6p6qkc4bu	\N	64670b34-c9d2-406d-a580-a22d019bb6ee-25	openai/gpt-4o	1415	113	1528	0.004667500000000001	2026-03-20T08:45:34.526Z	0
cmmynlyqv00019gxpmtud5wgd	49	9fef0e8a-1b6b-45ba-a328-1d159e547281-58	anthropic/claude-haiku-4.5	6165	961	7126	0.008775999999999999	2026-03-20T08:45:27.463Z	0
cmmynlyc6000lpftx2zlze528	20	64670b34-c9d2-406d-a580-a22d019bb6ee-25	anthropic/claude-haiku-4.5	61499	1889	63388	0.0567552	2026-03-20T08:45:26.934Z	0
cmmynkvgf000bfwdphdworo6t	\N	da16f559-923b-48e1-bf65-73ad86d6c271	openai/gpt-4o	553	118	671	0.0025625	2026-03-20T08:44:36.543Z	0
cmmynjae10009fwdpn2stxt97	\N	c570d2e3-66cc-4670-926e-81fcff9bcb2e-58	openai/gpt-4o	504	122	626	0.00248	2026-03-20T08:43:22.585Z	0
cmmynj4ti00032s1rff4uhryr	49	c570d2e3-66cc-4670-926e-81fcff9bcb2e-58	anthropic/claude-haiku-4.5	6384	165	6549	0.0057672	2026-03-20T08:43:15.366Z	0
cmmynixi50007fwdpk8u9yobx	\N	64670b34-c9d2-406d-a580-a22d019bb6ee-25	openai/gpt-4o	887	146	1033	0.0036775	2026-03-20T08:43:05.885Z	0
cmmynir8b000jpftx327rnn0d	20	64670b34-c9d2-406d-a580-a22d019bb6ee-25	anthropic/claude-haiku-4.5	60072	1386	61458	0.0536016	2026-03-20T08:42:57.755Z	0
cmmynhbmg0005fwdpdazltepu	\N	da16f559-923b-48e1-bf65-73ad86d6c271	openai/gpt-4o	2177	131	2308	0.006752500000000001	2026-03-20T08:41:50.872Z	0
cmmynh5ds0005r2mkgicjb9hl	118	da16f559-923b-48e1-bf65-73ad86d6c271	anthropic/claude-haiku-4.5	9263	1948	11211	0.0152024	2026-03-20T08:41:42.784Z	0
cmmyngk0l00012s1rj32x6vy5	49	c570d2e3-66cc-4670-926e-81fcff9bcb2e-58	anthropic/claude-haiku-4.5	5153	217	5370	0.0049904	2026-03-20T08:41:15.093Z	0
cmmyndubt000deoz61xs123mr	\N	64670b34-c9d2-406d-a580-a22d019bb6ee-25	openai/gpt-4o	756	101	857	0.0029	2026-03-20T08:39:08.489Z	0
cmmyndood000hpftx867gln0z	20	64670b34-c9d2-406d-a580-a22d019bb6ee-25	anthropic/claude-haiku-4.5	59418	592	60010	0.0499024	2026-03-20T08:39:01.165Z	0
cmmypnaui0009ybz2l7gskd4g	49	237771fd-3353-4588-a656-daeec712d4b6-58	anthropic/claude-haiku-4.5	6794	275	7069	0.0065352	2026-03-20T09:42:29.034Z	0
cmmyp73qi0001ldaetr2jvfnb	\N	3346b0ee-7c1d-4aad-8149-8bd1ceed75ed	openai/gpt-4o	1695	118	1813	0.0054175	2026-03-20T09:29:53.322Z	0
cmmyp6vk10003bb4w546you9c	6	3346b0ee-7c1d-4aad-8149-8bd1ceed75ed	anthropic/claude-haiku-4.5	72537	522	73059	0.0601176	2026-03-20T09:29:42.721Z	0
cmmyp6m030007ybz2c5qzpm45	49	237771fd-3353-4588-a656-daeec712d4b6-58	anthropic/claude-haiku-4.5	6266	273	6539	0.0061048	2026-03-20T09:29:30.339Z	0
cmmyp605t0001nagjxspiscxr	\N	3346b0ee-7c1d-4aad-8149-8bd1ceed75ed	openai/gpt-4o	4890	117	5007	0.013395	2026-03-20T09:29:02.033Z	0
cmmyp5se90001bb4wukmsuk34	6	3346b0ee-7c1d-4aad-8149-8bd1ceed75ed	anthropic/claude-haiku-4.5	70690	1446	72136	0.062336	2026-03-20T09:28:51.969Z	0
cmmymuoeb0007eoz6xkr4b20y	\N	a2de0efb-6a2c-4562-b5bd-2771cac6e1b4-25	openai/gpt-4o	643	121	764	0.002817500000000001	2026-03-20T08:24:14.339Z	0
cmmymu3w50005eoz6cjxw5hk4	\N	64670b34-c9d2-406d-a580-a22d019bb6ee-25	openai/gpt-4o	3328	143	3471	0.009750000000000002	2026-03-20T08:23:47.765Z	0
cmmymtvpy000dpftxxx3yz5ho	20	64670b34-c9d2-406d-a580-a22d019bb6ee-25	anthropic/claude-haiku-4.5	55331	4096	59427	0.0606488	2026-03-20T08:23:37.174Z	0
cmmymr2v70003eoz68yfvxbif	\N	64670b34-c9d2-406d-a580-a22d019bb6ee-25	openai/gpt-4o	3364	149	3513	0.0099	2026-03-20T08:21:26.467Z	0
cmmymqn29000bpftxq6vwa8uw	20	64670b34-c9d2-406d-a580-a22d019bb6ee-25	anthropic/claude-haiku-4.5	44641	4096	48737	0.0520968	2026-03-20T08:21:05.985Z	0
cmmymojss0009pftxrqkp3ugy	20	64670b34-c9d2-406d-a580-a22d019bb6ee-25	anthropic/claude-haiku-4.5	40707	4096	44803	0.0489496	2026-03-20T08:19:28.444Z	0
cmmymdqgc0001eoz6ldewkmzo	\N	64670b34-c9d2-406d-a580-a22d019bb6ee-25	openai/gpt-4o	1966	145	2111	0.006365	2026-03-20T08:11:03.852Z	0
cmmymdgqo0007pftx673raan6	20	64670b34-c9d2-406d-a580-a22d019bb6ee-25	anthropic/claude-haiku-4.5	35560	2537	38097	0.038596	2026-03-20T08:10:51.264Z	0
cmmym0lfg0005pftxyl7sr7qg	20	64670b34-c9d2-406d-a580-a22d019bb6ee-25	anthropic/claude-haiku-4.5	25357	2093	27450	0.0286576	2026-03-20T08:00:50.812Z	0
cmmylyltp000bdlvoffakoh8q	20	a2de0efb-6a2c-4562-b5bd-2771cac6e1b4-25	anthropic/claude-haiku-4.5	13797	849	14646	0.0144336	2026-03-20T07:59:18.013Z	0
cmmylwzrb00018lm43f0pr244	47	a8990c34-7685-4645-aea5-792ebb6e47c4-56	anthropic/claude-haiku-4.5	5712	1592	7304	0.0109376	2026-03-20T07:58:02.759Z	0
cmmylws2h0009dlvoqrvyufcg	20	a2de0efb-6a2c-4562-b5bd-2771cac6e1b4-25	anthropic/claude-haiku-4.5	7785	448	8233	0.00802	2026-03-20T07:57:52.793Z	0
cmmylvwzk00018vjdmw691bol	47	070cb3fb-0e63-4fec-84ee-fb370f380307-56	anthropic/claude-haiku-4.5	5704	1254	6958	0.0095792	2026-03-20T07:57:12.512Z	0
cmmylvq0r0007dlvo2pfyj28g	20	a2de0efb-6a2c-4562-b5bd-2771cac6e1b4-25	anthropic/claude-haiku-4.5	7335	212	7547	0.006716	2026-03-20T07:57:03.483Z	0
cmmylrvtr0005dlvo5e7exfbl	20	a2de0efb-6a2c-4562-b5bd-2771cac6e1b4-25	anthropic/claude-haiku-4.5	7114	202	7316	0.006499199999999999	2026-03-20T07:54:04.383Z	0
cmmylrghl0003dlvoxpnnq4j9	20	a2de0efb-6a2c-4562-b5bd-2771cac6e1b4-25	anthropic/claude-haiku-4.5	6380	146	6526	0.005688	2026-03-20T07:53:44.505Z	0
cmmylqxut0001dlvo1eyion7c	20	a2de0efb-6a2c-4562-b5bd-2771cac6e1b4-25	anthropic/claude-haiku-4.5	5921	365	6286	0.006196800000000001	2026-03-20T07:53:20.357Z	0
cmmylie4q0003pftx8qyosldf	20	64670b34-c9d2-406d-a580-a22d019bb6ee-25	anthropic/claude-haiku-4.5	14617	1966	16583	0.0195576	2026-03-20T07:46:41.546Z	0
cmmyldlr50001pftxd7d9msut	20	64670b34-c9d2-406d-a580-a22d019bb6ee-25	anthropic/claude-haiku-4.5	7941	953	8894	0.0101648	2026-03-20T07:42:58.145Z	0
cmmylcr4200019wbgn746mz1m	20	30e69d47-2224-4954-b10c-622d2bb30ab1-25	anthropic/claude-haiku-4.5	6260	410	6670	0.006647999999999999	2026-03-20T07:42:18.434Z	0
cmmykzquh000112pyvgcp2sbm	8	eeec03fd-13a1-4a08-8035-63a091b24e84-11	anthropic/claude-haiku-4.5	5152	31	5183	0.0042456	2026-03-20T07:32:11.561Z	0
cmmykz6cw0007wjgwd0htp08l	8	2945bf36-4c72-4421-891c-888d688babd6-11	anthropic/claude-haiku-4.5	5363	268	5631	0.0053624	2026-03-20T07:31:45.008Z	0
cmmykyfie0005wjgw1ssvtzp4	8	2945bf36-4c72-4421-891c-888d688babd6-11	anthropic/claude-haiku-4.5	5189	22	5211	0.0042392	2026-03-20T07:31:10.214Z	0
cmmyky6nr0003wjgwxarl5hh2	8	2945bf36-4c72-4421-891c-888d688babd6-11	anthropic/claude-haiku-4.5	5173	12	5185	0.0041864	2026-03-20T07:30:58.743Z	0
cmmyky0700001wjgwh6asmv6g	8	2945bf36-4c72-4421-891c-888d688babd6-11	anthropic/claude-haiku-4.5	5152	17	5169	0.0041896	2026-03-20T07:30:50.364Z	0
cmmykqvqk00016z35fwd4kh98	47	eee76679-99bb-4241-a70a-f4d1f77efe3e-56	anthropic/claude-haiku-4.5	5564	1264	6828	0.0095072	2026-03-20T07:25:17.996Z	0
cmmyko7ke00092kxkra6s2dv7	47	75220012-ac0b-452c-b241-1330538ce6a2-56	anthropic/claude-haiku-4.5	12978	2778	15756	0.0214944	2026-03-20T07:23:13.358Z	0
cmmykmoqu00072kxkj2apey83	47	75220012-ac0b-452c-b241-1330538ce6a2-56	anthropic/claude-haiku-4.5	10486	1936	12422	0.0161328	2026-03-20T07:22:02.310Z	0
cmmykm1qs00052kxkui0ogvzx	47	75220012-ac0b-452c-b241-1330538ce6a2-56	anthropic/claude-haiku-4.5	8265	1654	9919	0.013228	2026-03-20T07:21:32.500Z	0
cmmykliu100032kxkidv9ib6x	47	75220012-ac0b-452c-b241-1330538ce6a2-56	anthropic/claude-haiku-4.5	6755	919	7674	0.00908	2026-03-20T07:21:07.993Z	0
cmmykl4pi00012kxkzj9y950r	47	75220012-ac0b-452c-b241-1330538ce6a2-56	anthropic/claude-haiku-4.5	5545	803	6348	0.007648	2026-03-20T07:20:49.686Z	0
cmmyk9pwr0001ti5zq2lsi7ve	47	83658ccf-e909-45fa-b253-560ae8065ad3-56	anthropic/claude-haiku-4.5	5372	574	5946	0.0065936	2026-03-20T07:11:57.291Z	0
cmmyk3hbx0003o9wuvv3o9zui	47	9c0c8c4a-2bdd-489a-82e4-3f4d52d66cc5-56	anthropic/claude-haiku-4.5	6125	836	6961	0.008244	2026-03-20T07:07:06.237Z	0
cmmyjzik50001o9wualixndze	47	9c0c8c4a-2bdd-489a-82e4-3f4d52d66cc5-56	anthropic/claude-haiku-4.5	5377	534	5911	0.0064376	2026-03-20T07:04:01.205Z	0
cmmyjxc510003bawqduus1pz6	47	a69d9bc6-350a-4078-858e-70d696721348-56	anthropic/claude-haiku-4.5	6571	805	7376	0.0084768	2026-03-20T07:02:19.573Z	0
cmmyjv5z20001bawqec8q1x6l	47	a69d9bc6-350a-4078-858e-70d696721348-56	anthropic/claude-haiku-4.5	5554	619	6173	0.006919199999999999	2026-03-20T07:00:38.270Z	0
cmmyjttod0001zwii38sbn9pi	8	582cafb6-42f4-412a-95ae-413df9aafe9c-11	anthropic/claude-haiku-4.5	5151	32	5183	0.0042488	2026-03-20T06:59:35.677Z	0
cmmyn9uni000fpftxr7281rsi	20	64670b34-c9d2-406d-a580-a22d019bb6ee-25	anthropic/claude-haiku-4.5	58959	429	59388	0.0488832	2026-03-20T08:36:02.286Z	0
cmmyn80s1000beoz60istzszb	\N	64670b34-c9d2-406d-a580-a22d019bb6ee-25	openai/gpt-4o	2267	132	2399	0.006987500000000001	2026-03-20T08:34:36.913Z	0
cmmyn1es90003r2mkub9336fe	118	da16f559-923b-48e1-bf65-73ad86d6c271	anthropic/claude-haiku-4.5	6151	534	6685	0.007056799999999999	2026-03-20T08:29:28.473Z	0
cmmyn0p7n0001r2mkm1759jfc	118	da16f559-923b-48e1-bf65-73ad86d6c271	anthropic/claude-haiku-4.5	5167	448	5615	0.0059256	2026-03-20T08:28:55.331Z	0
cmmymzkj90009eoz6ka3s2qym	\N	a2de0efb-6a2c-4562-b5bd-2771cac6e1b4-25	openai/gpt-4o	602	127	729	0.002775	2026-03-20T08:28:02.613Z	0
cmmymyl9r0001fwdpouqmap7b	\N	a2de0efb-6a2c-4562-b5bd-2771cac6e1b4-25	openai/gpt-4o	618	111	729	0.002655	2026-03-20T08:27:16.911Z	0
cmmyjfmdv0001q2editi89phh	47	d9c26e35-5c7c-4f4c-9cbe-a875bca5f6f9-56	anthropic/claude-haiku-4.5	6352	1092	7444	0.009449599999999999	2026-03-20T06:48:33.043Z	0
cmmyjerzd0001kbexhlfk5xin	8	8cf4d193-3165-4302-bd59-21c6955184a9-11	anthropic/claude-haiku-4.5	5151	31	5182	0.0042448	2026-03-20T06:47:53.641Z	0
cmmyjaxik0001hpi7gf9fl0fn	47	d9c26e35-5c7c-4f4c-9cbe-a875bca5f6f9-56	anthropic/claude-haiku-4.5	5382	570	5952	0.0065856	2026-03-20T06:44:54.188Z	0
cmmyizlq40001gpa6uw8z18lz	8	6b00b98f-0f92-4222-bcf6-3e382467070e-11	anthropic/claude-haiku-4.5	5152	16	5168	0.004185599999999999	2026-03-20T06:36:05.692Z	0
cmmy9nlun0001p3t6hlg9h2ng	25	adbe2b64-7f8e-4e26-8533-98874e822a10-32	anthropic/claude-haiku-4.5	5151	32	5183	0.0042488	2026-03-20T02:14:49.439Z	0
cmmy9mona0001x55u991zs9vb	\N	e50a1040-c7dd-4734-8e22-cbb848d28c6a	openai/gpt-4o	510	122	632	0.002495	2026-03-20T02:14:06.406Z	0
cmmy9mnen0001zkpofgl0l5qo	3	03371af8-075e-4aca-82ff-c70610ba6d28-3	anthropic/claude-haiku-4.5	5160	210	5370	0.004967999999999999	2026-03-20T02:14:04.799Z	0
cmmy9mgie0003e1x3jr5nzwra	25	e50a1040-c7dd-4734-8e22-cbb848d28c6a	anthropic/claude-haiku-4.5	5219	25	5244	0.0042752	2026-03-20T02:13:55.862Z	0
cmmy9m98a0001e1x35unsc261	25	e50a1040-c7dd-4734-8e22-cbb848d28c6a	anthropic/claude-haiku-4.5	5151	61	5212	0.0043648	2026-03-20T02:13:46.426Z	0
cmmy9ik790001rcbd1u24asio	3	49e04e38-e467-401f-8989-42ea642a1fc1-3	anthropic/claude-haiku-4.5	5157	145	5302	0.0047056	2026-03-20T02:10:54.021Z	0
cmmy9hq5m00017jzoz26488uy	3	ddb75383-4108-40d6-8866-cb7c11e3f498-3	anthropic/claude-haiku-4.5	5796	644	6440	0.0072128	2026-03-20T02:10:15.082Z	0
cmmy9hbzx0001ydvck2na3gew	8	2220f3f7-e169-444d-bf9e-59223ce9336f-11	anthropic/claude-haiku-4.5	6663	516	7179	0.0073944	2026-03-20T02:09:56.733Z	0
cmmy9ezl90001wc3ztzic9dkb	3	834f3ff8-ae40-4ba8-9983-7902df4725c2	anthropic/claude-haiku-4.5	5750	543	6293	0.006772	2026-03-20T02:08:07.341Z	0
cmmy8hx140001lxuvqba9pl50	3	c4c1b3ef-da6f-43ac-b5e0-2a3ce49ff99d	anthropic/claude-haiku-4.5	5159	128	5287	0.0046392	2026-03-20T01:42:24.376Z	0
cmmxlr2he0001491u02klhkpl	\N	e976c11e-3351-450b-aadd-1fb36015cc49	openai/gpt-4o	1109	128	1237	0.004052500000000001	2026-03-19T15:05:40.178Z	0
cmmxlqhx700037ue7aewhmyq1	114	e976c11e-3351-450b-aadd-1fb36015cc49	anthropic/claude-haiku-4.5	12257	750	13007	0.0128056	2026-03-19T15:05:13.531Z	0
cmmxlppad00017ue7iavbejcv	114	e976c11e-3351-450b-aadd-1fb36015cc49	anthropic/claude-haiku-4.5	9435	1122	10557	0.012036	2026-03-19T15:04:36.421Z	0
cmmxca6tp000110yq451kosv6	47	b9495672-3137-4437-a1a6-25ec5a9f1be4-56	anthropic/claude-haiku-4.5	7471	470	7941	0.0078568	2026-03-19T10:40:36.109Z	0
cmmxc6ubg0003e3qxs5gocis5	\N	7593469f-521a-42cb-a113-86ab20f5babf-11	openai/gpt-4o	507	105	612	0.0023175	2026-03-19T10:37:59.932Z	0
cmmxc6ncn0003pklfb114txb8	8	7593469f-521a-42cb-a113-86ab20f5babf-11	anthropic/claude-haiku-4.5	7897	616	8513	0.0087816	2026-03-19T10:37:50.903Z	0
cmmxc60ve0001pklfdg31djz6	8	7593469f-521a-42cb-a113-86ab20f5babf-11	anthropic/claude-haiku-4.5	5162	296	5458	0.0053136	2026-03-19T10:37:21.770Z	0
cmmxbgnbk0009wx5gtzgitf9t	49	e113ee41-0062-40ea-9bef-3c431838f023-58	anthropic/claude-haiku-4.5	7166	1133	8299	0.0102648	2026-03-19T10:17:37.808Z	0
cmmxbg74d0001jktidg5y35nf	\N	e113ee41-0062-40ea-9bef-3c431838f023-58	openai/gpt-4o	524	113	637	0.00244	2026-03-19T10:17:16.813Z	0
cmmxbg6830007wx5gisffe96n	49	e113ee41-0062-40ea-9bef-3c431838f023-58	anthropic/claude-haiku-4.5	6872	161	7033	0.0061416	2026-03-19T10:17:15.651Z	0
cmmxbfypl0005wx5gdicejtzs	49	e113ee41-0062-40ea-9bef-3c431838f023-58	anthropic/claude-haiku-4.5	6594	151	6745	0.005879199999999999	2026-03-19T10:17:05.913Z	0
cmmxbf7h10001w5kgmsco2h6o	\N	e113ee41-0062-40ea-9bef-3c431838f023-58	openai/gpt-4o	495	115	610	0.0023875	2026-03-19T10:16:30.613Z	0
cmmxbf05j0003wx5gglzzemtc	49	e113ee41-0062-40ea-9bef-3c431838f023-58	anthropic/claude-haiku-4.5	6164	219	6383	0.0058072	2026-03-19T10:16:21.127Z	0
cmmxb5sv00001e3qxjlcy7k9s	\N	fb383744-727b-4552-a8a9-9650d7401b59-25	openai/gpt-4o	545	144	689	0.0028025	2026-03-19T10:09:11.772Z	0
cmmxb5lb6000bveum0qrwbcvb	20	fb383744-727b-4552-a8a9-9650d7401b59-25	anthropic/claude-haiku-4.5	8640	1592	10232	0.01328	2026-03-19T10:09:01.986Z	0
cmmxb3nd00001iptnc0sayl80	\N	fb383744-727b-4552-a8a9-9650d7401b59-25	openai/gpt-4o	1342	135	1477	0.004705000000000001	2026-03-19T10:07:31.332Z	0
cmmxb3fhz0009veumhjvt6gqv	20	fb383744-727b-4552-a8a9-9650d7401b59-25	anthropic/claude-haiku-4.5	7961	295	8256	0.0075488	2026-03-19T10:07:21.143Z	0
cmmxb1q4w0007veum6d29rk5j	20	fb383744-727b-4552-a8a9-9650d7401b59-25	anthropic/claude-haiku-4.5	6734	1198	7932	0.0101792	2026-03-19T10:06:01.616Z	0
cmmxb0nf50005veum5oslv4ej	20	fb383744-727b-4552-a8a9-9650d7401b59-25	anthropic/claude-haiku-4.5	5806	471	6277	0.0065288	2026-03-19T10:05:11.441Z	0
cmmxazu9b0003veumf7552u4o	20	fb383744-727b-4552-a8a9-9650d7401b59-25	anthropic/claude-haiku-4.5	5544	258	5802	0.005467199999999999	2026-03-19T10:04:33.647Z	0
cmmxaxrxj0001veumbawbpjf1	20	fb383744-727b-4552-a8a9-9650d7401b59-25	anthropic/claude-haiku-4.5	2993	111	3104	0.0028384	2026-03-19T10:02:57.319Z	0
cmmx7mqg00001lxxnedh02e4l	3	7dcd5ecb-3e5b-4c17-86a8-935a3c99b33b	anthropic/claude-haiku-4.5	5157	185	5342	0.0048656	2026-03-19T08:30:23.328Z	0
cmmx7lfv20001oty98ot43eas	3	9786e671-f7e0-4c02-90eb-942dc322b2fc	anthropic/claude-haiku-4.5	5156	215	5371	0.004984799999999999	2026-03-19T08:29:22.958Z	0
cmmyjpkrp0005kbex601cruqb	8	8cf4d193-3165-4302-bd59-21c6955184a9-11	anthropic/claude-haiku-4.5	5730	233	5963	0.005515999999999999	2026-03-20T06:56:17.509Z	0
cmmyjovhg0003kbext33dnq63	8	8cf4d193-3165-4302-bd59-21c6955184a9-11	anthropic/claude-haiku-4.5	5335	233	5568	0.0052	2026-03-20T06:55:44.740Z	0
cmmyjnfxn0001zawma3iudxwi	47	a19b30b3-8226-4b94-a8a9-86e7dd30280c-56	anthropic/claude-haiku-4.5	5559	619	6178	0.0069232	2026-03-20T06:54:37.931Z	0
cmmyji7y6000112ioc3gf5j8m	47	f87b1958-0f6b-4de3-b27e-2e98b442ffdc-56	anthropic/claude-haiku-4.5	5367	646	6013	0.006877599999999999	2026-03-20T06:50:34.302Z	0
cmmyjg6u700014u9g35mvhm1a	47	54e5dfbc-0dfe-4f23-b901-21beb8091fb4-56	anthropic/claude-haiku-4.5	5534	792	6326	0.0075952	2026-03-20T06:48:59.551Z	0
cmmyjftpt0001cr10vx6sro9z	\N	d9c26e35-5c7c-4f4c-9cbe-a875bca5f6f9-56	openai/gpt-4o	828	114	942	0.00321	2026-03-20T06:48:42.545Z	0
cmmx714we0001mt08bxz1a14c	49	1cd36b3a-55cf-4385-8618-6aff20fa9c43-58	anthropic/claude-haiku-4.5	5154	510	5664	0.006163199999999999	2026-03-19T08:13:35.630Z	0
cmmx70qj80001xkeshu7fi0fj	49	ee9ae477-a987-4248-acb3-ca3910294324-58	anthropic/claude-haiku-4.5	6156	182	6338	0.005652799999999999	2026-03-19T08:13:17.012Z	0
cmmx6647a0001nt0glb1lpwjf	3	d77656be-b6b4-4a55-a328-f5c8f0fd29e3-3	anthropic/claude-haiku-4.5	5153	323	5476	0.0054144	2026-03-19T07:49:28.390Z	0
cmmx5yaym0001ti8wmdjwdvxw	\N	fb5f010e-39d3-42d6-9901-8a8224d2a368-3	openai/gpt-4o	597	131	728	0.0028025	2026-03-19T07:43:23.902Z	0
cmmx5y36t0003qcks83x8d6l1	3	fb5f010e-39d3-42d6-9901-8a8224d2a368-3	anthropic/claude-haiku-4.5	5397	560	5957	0.006557599999999999	2026-03-19T07:43:13.829Z	0
cmmx5xk8n0001qcksltwsi2s8	3	fb5f010e-39d3-42d6-9901-8a8224d2a368-3	anthropic/claude-haiku-4.5	5159	221	5380	0.0050112	2026-03-19T07:42:49.271Z	0
cmmwy89ap0001fc1hw5hi6ig4	49	3ca20468-ef72-4d9e-9528-839cecb542db-58	anthropic/claude-haiku-4.5	5660	352	6012	0.005936	2026-03-19T04:07:11.377Z	0
cmmwy0mjn0001n8lo6ayx76pg	42	75cd3d50-4525-4856-9dc2-a08cb99eccb6-49	anthropic/claude-haiku-4.5	5156	133	5289	0.0046568	2026-03-19T04:01:15.299Z	0
cmmwy023s00017ve2pf1hhniv	107	aad3d2c0-bde1-4c9b-aa60-c9fda638c368	anthropic/claude-haiku-4.5	5152	31	5183	0.0042456	2026-03-19T04:00:48.808Z	0
cmmwv6ge90001uyekumygfupj	\N	5d185b97-2880-4025-9ea7-67e8419abeb6-60	openai/gpt-4o	537	119	656	0.0025325	2026-03-19T02:41:48.417Z	0
cmmwv68pw0003124i3opwsqyj	51	5d185b97-2880-4025-9ea7-67e8419abeb6-60	anthropic/claude-haiku-4.5	6380	92	6472	0.005472	2026-03-19T02:41:38.468Z	0
cmmwv5ukh0001124it2erytj4	51	5d185b97-2880-4025-9ea7-67e8419abeb6-60	anthropic/claude-haiku-4.5	5154	404	5558	0.0057392	2026-03-19T02:41:20.129Z	0
cmmwv4v3f0001icfs2d48paa9	\N	bb4175e9-2336-474b-82fc-d34619bcf541	openai/gpt-4o	507	128	635	0.0025475	2026-03-19T02:40:34.155Z	0
cmmwv4lzt0003jc2n8be8ah70	105	bb4175e9-2336-474b-82fc-d34619bcf541	anthropic/claude-haiku-4.5	5483	463	5946	0.0062384	2026-03-19T02:40:22.361Z	0
cmmwv4csm0001jc2n0ttsda6o	105	bb4175e9-2336-474b-82fc-d34619bcf541	anthropic/claude-haiku-4.5	5155	191	5346	0.004888	2026-03-19T02:40:10.438Z	0
cmmvw8kws00018z4qjsms9bre	\N	3c36ec7e-1063-4099-a02b-e562d176b028-36	openai/gpt-4o	705	129	834	0.003052500000000001	2026-03-18T10:23:41.020Z	0
cmmvw8cv00003wwppjncwcyma	29	3c36ec7e-1063-4099-a02b-e562d176b028-36	anthropic/claude-haiku-4.5	13819	1929	15748	0.0187712	2026-03-18T10:23:30.588Z	0
cmmvw5jhg0001wwpp8zlt8iyf	29	3c36ec7e-1063-4099-a02b-e562d176b028-36	anthropic/claude-haiku-4.5	7753	693	8446	0.008974399999999999	2026-03-18T10:21:19.204Z	0
cmmvvxx3g000199za0you2itq	\N	16e507c9-ccc9-498d-bf3a-2277ed670a51	openai/gpt-4o	792	133	925	0.00331	2026-03-18T10:15:23.596Z	0
cmmvvxody000121wg00xhqwtn	53	16e507c9-ccc9-498d-bf3a-2277ed670a51	anthropic/claude-haiku-4.5	8496	254	8750	0.0078128	2026-03-18T10:15:12.310Z	0
cmmvvrjkf0001123wfy0psp8s	8	54b90269-a197-4349-818e-f30dd56499c0-11	anthropic/claude-haiku-4.5	6960	454	7414	0.007384	2026-03-18T10:10:26.127Z	0
cmmvsdlax0007zxsbat5ilcbf	\N	2a244075-60b1-47b5-933e-357c1493be92-25	openai/gpt-4o	659	109	768	0.0027375	2026-03-18T08:35:36.345Z	0
cmmvsdjbe0005zxsbjbpkuk5j	\N	2a244075-60b1-47b5-933e-357c1493be92-25	openai/gpt-4o	1440	134	1574	0.00494	2026-03-18T08:35:33.770Z	0
cmmvs80b90003zxsbybw1c9rs	\N	2a244075-60b1-47b5-933e-357c1493be92-25	openai/gpt-4o	573	119	692	0.0026225	2026-03-18T08:31:15.861Z	0
cmmvs01v80001zxsbwt60ad7d	\N	5bab9422-c5cb-45a6-8eb9-f4ebda404caa	openai/gpt-4o	624	124	748	0.0028	2026-03-18T08:25:04.628Z	0
cmmvrqs1w0007qxof7o3zcomt	20	2a244075-60b1-47b5-933e-357c1493be92-25	anthropic/claude-haiku-4.5	13408	568	13976	0.0129984	2026-03-18T08:17:52.004Z	0
cmmvrp2ll0005qxof1vf1kg57	20	2a244075-60b1-47b5-933e-357c1493be92-25	anthropic/claude-haiku-4.5	11337	295	11632	0.0102496	2026-03-18T08:16:32.361Z	0
cmmvroi9a0003qxofiau284tq	20	2a244075-60b1-47b5-933e-357c1493be92-25	anthropic/claude-haiku-4.5	9980	1345	11325	0.013364	2026-03-18T08:16:05.998Z	0
cmmvrn2ph0001qxof8rsojxrt	20	2a244075-60b1-47b5-933e-357c1493be92-25	anthropic/claude-haiku-4.5	4911	381	5292	0.0054528	2026-03-18T08:14:59.189Z	0
cmmvrm4iu000114lqgs20u42f	20	4ded5414-b282-4a26-967a-5cf9bd8ad7c2-25	anthropic/claude-haiku-4.5	5465	508	5973	0.006404	2026-03-18T08:14:14.886Z	0
cmmvrljli0001zj9hisdd0ync	20	c4092bfa-1754-4042-9576-2845c647950f-25	anthropic/claude-haiku-4.5	4081	97	4178	0.0036528	2026-03-18T08:13:47.766Z	0
cmmvris0o0001n3v0r1j5ekcy	47	cc483011-b811-443f-9c8d-8a86f4c10cad-56	anthropic/claude-haiku-4.5	6618	556	7174	0.0075184	2026-03-18T08:11:38.712Z	0
cmmvrgjkt00034ip9gh5wvjqt	101	5bab9422-c5cb-45a6-8eb9-f4ebda404caa	anthropic/claude-haiku-4.5	5956	70	6026	0.005044799999999999	2026-03-18T08:09:54.461Z	0
cmmvrb83h00014ip9jovqubxl	101	5bab9422-c5cb-45a6-8eb9-f4ebda404caa	anthropic/claude-haiku-4.5	4962	435	5397	0.0057096	2026-03-18T08:05:46.301Z	0
cmmvrab1q0001mdc3i2rpty2s	94	62d11b12-075f-4554-9e77-7172e579b681	anthropic/claude-haiku-4.5	4092	94	4186	0.0036496	2026-03-18T08:05:03.470Z	0
cmmvr64500001tpg760cmzmnd	95	7cd0fc23-1414-4f6e-a991-2d79ffd201e5	anthropic/claude-haiku-4.5	4101	243	4344	0.0042528	2026-03-18T08:01:47.892Z	0
cmmvr5oqo000132bsewvzo3d1	95	973d767e-9419-4b6e-a517-0c37b2f8ea18	anthropic/claude-haiku-4.5	4102	46	4148	0.0034656	2026-03-18T08:01:27.936Z	0
cmmx75ksr0003gn1n1ngskqv3	8	f465cfd5-5884-4cdd-abb1-5943a6545889-11	anthropic/claude-haiku-4.5	6154	233	6387	0.0058552	2026-03-19T08:17:02.859Z	0
cmmx75i6x0001cig167mvasll	3	cac3434e-bc79-4096-b6c4-e07289d3fddf-3	anthropic/claude-haiku-4.5	5163	262	5425	0.0051784	2026-03-19T08:16:59.481Z	0
cmmx754q80001syvyiuzcxwsw	\N	e664fd24-a4d9-4644-8a78-4350f0e851ed-58	openai/gpt-4o	551	118	669	0.0025575	2026-03-19T08:16:42.032Z	0
cmmx74x320003ci3sbn16gorf	49	e664fd24-a4d9-4644-8a78-4350f0e851ed-58	anthropic/claude-haiku-4.5	5762	1078	6840	0.0089216	2026-03-19T08:16:32.126Z	0
cmmx72z720001ci3sagedq7hb	49	e664fd24-a4d9-4644-8a78-4350f0e851ed-58	anthropic/claude-haiku-4.5	5154	373	5527	0.005615199999999999	2026-03-19T08:15:01.550Z	0
cmmx72k930001gn1ngd59wsiq	8	f465cfd5-5884-4cdd-abb1-5943a6545889-11	anthropic/claude-haiku-4.5	5511	168	5679	0.0050808	2026-03-19T08:14:42.183Z	0
cmmvq61mj0007gosvw9u0kk2f	25	d9037420-cdff-4a88-b71e-ae4834c2c96a-32	anthropic/claude-haiku-4.5	10109	310	10419	0.009327199999999999	2026-03-18T07:33:45.019Z	0
cmmvq576r0001f95213ni36fo	\N	d9037420-cdff-4a88-b71e-ae4834c2c96a-32	openai/gpt-4o	760	124	884	0.00314	2026-03-18T07:33:05.571Z	0
cmmvq4yy90005gosvixqnuqnr	25	d9037420-cdff-4a88-b71e-ae4834c2c96a-32	anthropic/claude-haiku-4.5	9521	538	10059	0.0097688	2026-03-18T07:32:54.897Z	0
cmmvq1zkv0001n0a71ya2z4ga	\N	d9037420-cdff-4a88-b71e-ae4834c2c96a-32	openai/gpt-4o	546	112	658	0.002485	2026-03-18T07:30:35.743Z	0
cmmvq1s3v0003gosv6euu5o3p	25	d9037420-cdff-4a88-b71e-ae4834c2c96a-32	anthropic/claude-haiku-4.5	6572	421	6993	0.006941599999999999	2026-03-18T07:30:26.059Z	0
cmmvq0vvp0001gosv7kk438rm	25	d9037420-cdff-4a88-b71e-ae4834c2c96a-32	anthropic/claude-haiku-4.5	4078	74	4152	0.0035584	2026-03-18T07:29:44.293Z	0
cmmvpudzb0001bjxynf14isfp	\N	1922af24-b1ed-4b59-a8a8-7a201636cb84	openai/gpt-4o	475	116	591	0.0023475	2026-03-18T07:24:41.159Z	0
cmmvpu5wp0001st072j17r9og	53	1922af24-b1ed-4b59-a8a8-7a201636cb84	anthropic/claude-haiku-4.5	4106	52	4158	0.0034928	2026-03-18T07:24:30.697Z	0
cmmvpqfdy0001qr9nkbmwi76w	98	2c5c133f-43c4-4d69-8b45-5a083e102cd8	anthropic/claude-haiku-4.5	4079	16	4095	0.0033272	2026-03-18T07:21:36.358Z	0
cmmvg66u30001x1lckmxs80og	47	fae31f3b-0673-4d70-9d44-f3b5e6660f40-56	anthropic/claude-haiku-4.5	5678	345	6023	0.0059224	2026-03-18T02:53:55.611Z	0
cmmvdkrdz0001aijb2kr7ygpq	95	0963b2f5-ef85-45b0-b567-8b3709835280	anthropic/claude-haiku-4.5	6358	607	6965	0.007514399999999999	2026-03-18T01:41:16.583Z	0
cmmvdj9lh00017lj6fw5d9cnf	20	52d3e326-829f-4aec-82bd-1fdbabbef012-25	anthropic/claude-haiku-4.5	4864	1233	6097	0.0088232	2026-03-18T01:40:06.869Z	0
cmmueytd70001f5nn8xolasww	\N	46d8752f-a29c-473e-8944-ef8388d0cfd1	openai/gpt-4o	717	179	896	0.0035825	2026-03-17T09:32:25.771Z	0
cmmueylg70005yfqs8w1ceesr	95	46d8752f-a29c-473e-8944-ef8388d0cfd1	anthropic/claude-haiku-4.5	4548	309	4857	0.0048744	2026-03-17T09:32:15.511Z	0
cmmuex38d00019evqix4l7rdk	\N	46d8752f-a29c-473e-8944-ef8388d0cfd1	openai/gpt-4o	710	134	844	0.003115	2026-03-17T09:31:05.245Z	0
cmmuewupq0003yfqsrwd1xqf2	95	46d8752f-a29c-473e-8944-ef8388d0cfd1	anthropic/claude-haiku-4.5	4311	212	4523	0.0042968	2026-03-17T09:30:54.206Z	0
cmmuewc7l0001yfqsmf250cdk	95	46d8752f-a29c-473e-8944-ef8388d0cfd1	anthropic/claude-haiku-4.5	4087	192	4279	0.0040376	2026-03-17T09:30:30.225Z	0
cmmuew5oq000113e7t5r216jc	\N	7196cf56-28c5-4ed1-8c02-4532a4c33620	openai/gpt-4o	644	105	749	0.00266	2026-03-17T09:30:21.770Z	0
cmmuevxhg0003ywi014h2knx5	95	7196cf56-28c5-4ed1-8c02-4532a4c33620	anthropic/claude-haiku-4.5	4211	72	4283	0.0036568	2026-03-17T09:30:11.140Z	0
cmmuevgkp0001ywi0zegkkja6	95	7196cf56-28c5-4ed1-8c02-4532a4c33620	anthropic/claude-haiku-4.5	4086	89	4175	0.0036248	2026-03-17T09:29:49.225Z	0
cmmuetgf30001cqmlq593hunn	\N	98a1795a-8c99-4074-a248-8ad461be30ff	openai/gpt-4o	703	113	816	0.0028875	2026-03-17T09:28:15.711Z	0
cmmuet9h400079hrdff69quty	95	98a1795a-8c99-4074-a248-8ad461be30ff	anthropic/claude-haiku-4.5	9663	500	10163	0.0097304	2026-03-17T09:28:06.712Z	0
cmmuesplc0001148p0tbmmoy6	\N	98a1795a-8c99-4074-a248-8ad461be30ff	openai/gpt-4o	644	134	778	0.00295	2026-03-17T09:27:40.944Z	0
cmmuesifd00059hrdpbdjy7jy	95	98a1795a-8c99-4074-a248-8ad461be30ff	anthropic/claude-haiku-4.5	4328	185	4513	0.0042024	2026-03-17T09:27:31.657Z	0
cmmues5jg0001754l55yb1xes	\N	98a1795a-8c99-4074-a248-8ad461be30ff	openai/gpt-4o	644	110	754	0.00271	2026-03-17T09:27:14.956Z	0
cmmuerxnc00039hrdmf2qp1c9	95	98a1795a-8c99-4074-a248-8ad461be30ff	anthropic/claude-haiku-4.5	4215	67	4282	0.00364	2026-03-17T09:27:04.728Z	0
cmmuerkzl00019hrdrh2kv028	95	98a1795a-8c99-4074-a248-8ad461be30ff	anthropic/claude-haiku-4.5	4086	95	4181	0.0036488	2026-03-17T09:26:48.321Z	0
cmmtgt7bg0001hs6eexutb62z	8	bd1568ce-e6c3-4e6b-bafb-0224c92c49fe-11	anthropic/claude-haiku-4.5	5460	759	6219	0.007403999999999999	2026-03-16T17:36:16.972Z	0
cmmtfq0nz0001n0128by9b8wb	\N	93b2a137-353c-44db-9601-2f668e3c8f86-11	openai/gpt-4o	614	89	703	0.002425	2026-03-16T17:05:48.767Z	0
cmmtfpsqk0003ypgv619jn0hy	8	93b2a137-353c-44db-9601-2f668e3c8f86-11	anthropic/claude-haiku-4.5	4695	47	4742	0.003944	2026-03-16T17:05:38.492Z	0
cmmtfpfho0001ypgva2b1ye7d	8	93b2a137-353c-44db-9601-2f668e3c8f86-11	anthropic/claude-haiku-4.5	4308	31	4339	0.0035704	2026-03-16T17:05:21.324Z	0
cmmte4ubo0001bhmwgwp50qrn	\N	6515adad-4783-4974-a35b-d002960d8d6b-11	openai/gpt-4o	635	96	731	0.0025475	2026-03-16T16:21:21.156Z	0
cmmte4mbh000326h26utrnq2c	8	6515adad-4783-4974-a35b-d002960d8d6b-11	anthropic/claude-haiku-4.5	4735	84	4819	0.004124	2026-03-16T16:21:10.781Z	0
cmmtdy53t000126h2un18lpm3	8	6515adad-4783-4974-a35b-d002960d8d6b-11	anthropic/claude-haiku-4.5	4319	53	4372	0.0036672	2026-03-16T16:16:08.537Z	0
cmmtdu3ws00016qvb1kl3vxbo	29	9bcf5e5d-93e3-45fd-b114-69f329da3a41-36	anthropic/claude-haiku-4.5	4078	61	4139	0.0035064	2026-03-16T16:13:00.364Z	0
cmmtd7lrp0001gdlcyptdk8le	\N	59a28811-dd65-4c41-b849-0a85ad1d36de-11	openai/gpt-4o	614	90	704	0.002435	2026-03-16T15:55:30.421Z	0
cmmtd7dub00032t1c4cqitiay	8	59a28811-dd65-4c41-b849-0a85ad1d36de-11	anthropic/claude-haiku-4.5	4695	48	4743	0.003948	2026-03-16T15:55:20.147Z	0
cmmtd6ywk00012t1cavoucnh8	8	59a28811-dd65-4c41-b849-0a85ad1d36de-11	anthropic/claude-haiku-4.5	4308	31	4339	0.0035704	2026-03-16T15:55:00.788Z	0
cmmvq9y8q000dgosvb8mkm1se	25	d9037420-cdff-4a88-b71e-ae4834c2c96a-32	anthropic/claude-haiku-4.5	17214	425	17639	0.0154712	2026-03-18T07:36:47.258Z	0
cmmvq840a000bgosv8wcxuz9w	25	d9037420-cdff-4a88-b71e-ae4834c2c96a-32	anthropic/claude-haiku-4.5	16765	403	17168	0.015024	2026-03-18T07:35:21.418Z	0
cmmvq6x0r0001bg8x4tr4ql6v	\N	d9037420-cdff-4a88-b71e-ae4834c2c96a-32	openai/gpt-4o	664	107	771	0.00273	2026-03-18T07:34:25.707Z	0
cmmvq6pb10009gosv00ml83fb	25	d9037420-cdff-4a88-b71e-ae4834c2c96a-32	anthropic/claude-haiku-4.5	12331	336	12667	0.0112088	2026-03-18T07:34:15.709Z	0
cmmvq69m20001sluvr6s3ww4s	\N	d9037420-cdff-4a88-b71e-ae4834c2c96a-32	openai/gpt-4o	851	145	996	0.0035775	2026-03-18T07:33:55.370Z	0
cmmtb3ox80001zobtdvooojb0	\N	356ec1f9-c9ed-4390-a5f5-efcde60c5902-11	openai/gpt-4o	952	99	1051	0.00337	2026-03-16T14:56:28.652Z	0
cmmtb3gle000112ctvayeepo5	8	356ec1f9-c9ed-4390-a5f5-efcde60c5902-11	anthropic/claude-haiku-4.5	4642	746	5388	0.0066976	2026-03-16T14:56:17.858Z	0
cmmtaujzz00012fsqnllautmk	\N	356ec1f9-c9ed-4390-a5f5-efcde60c5902-11	openai/gpt-4o	616	171	787	0.00325	2026-03-16T14:49:22.367Z	0
cmmtauaex000313x0z3ms1bxr	8	356ec1f9-c9ed-4390-a5f5-efcde60c5902-11	anthropic/claude-haiku-4.5	4135	483	4618	0.00524	2026-03-16T14:49:09.945Z	0
cmmtas8wm000113x08b6bwez3	8	356ec1f9-c9ed-4390-a5f5-efcde60c5902-11	anthropic/claude-haiku-4.5	4079	32	4111	0.0033912	2026-03-16T14:47:34.678Z	0
cmmt92bkz0001s668x8ieobnn	\N	db8a2e75-a431-43d0-a662-3861e0f67a7a-11	openai/gpt-4o	634	169	803	0.003275	2026-03-16T13:59:25.475Z	0
cmmt922x40003jeyvfi0vi6uq	8	db8a2e75-a431-43d0-a662-3861e0f67a7a-11	anthropic/claude-haiku-4.5	4149	269	4418	0.0043952	2026-03-16T13:59:14.248Z	0
cmmt91klm0001jeyv6wai4xkw	8	db8a2e75-a431-43d0-a662-3861e0f67a7a-11	anthropic/claude-haiku-4.5	4080	63	4143	0.003516	2026-03-16T13:58:50.506Z	0
cmmt7tlkm0001dmeta2cb90zx	\N	207155cf-accc-4db0-9c49-854b1a5fb30f	openai/gpt-4o	653	126	779	0.0028925	2026-03-16T13:24:38.902Z	0
cmmt7tdag00031x63mwf2ga24	92	207155cf-accc-4db0-9c49-854b1a5fb30f	anthropic/claude-haiku-4.5	4168	29	4197	0.0034504	2026-03-16T13:24:28.168Z	0
cmmt7smj200011x637tl4o3cl	92	207155cf-accc-4db0-9c49-854b1a5fb30f	anthropic/claude-haiku-4.5	4084	72	4156	0.0035552	2026-03-16T13:23:53.486Z	0
cmmszwwas00019gvtrr2nmmbl	\N	339f1cf9-fcb2-46fb-8c66-db71b3440d25-56	openai/gpt-4o	1062	142	1204	0.004075	2026-03-16T09:43:15.844Z	0
cmmszwoog00039i4bx02monsm	47	339f1cf9-fcb2-46fb-8c66-db71b3440d25-56	anthropic/claude-haiku-4.5	11292	807	12099	0.0122616	2026-03-16T09:43:05.968Z	0
cmmsyzq0r00019i4b01mofked	47	339f1cf9-fcb2-46fb-8c66-db71b3440d25-56	anthropic/claude-haiku-4.5	7251	798	8049	0.0089928	2026-03-16T09:17:28.059Z	0
cmmsywxfw0001dkm4442yz8te	3	0a6a0054-6410-466d-93c3-3749573ede4f-3	anthropic/claude-haiku-4.5	4706	415	5121	0.0054248	2026-03-16T09:15:17.708Z	0
cmmsy97ki0001g8fj5hcsigc9	91	8392f9e2-55a0-4040-8664-ee05d2350d08	anthropic/claude-haiku-4.5	4082	160	4242	0.0039056	2026-03-16T08:56:51.090Z	0
cmmsxrc1y0001133rhxqjd7wa	3	7720af08-4543-4644-a7ff-b7349bc54c15-3	anthropic/claude-haiku-4.5	4102	523	4625	0.0053736	2026-03-16T08:42:57.094Z	0
cmmsxqzxn0003yvm0y8vvgph0	\N	fed40b08-b72f-44c4-99a5-dc937d62e282-3	openai/gpt-4o	674	116	790	0.002845	2026-03-16T08:42:41.387Z	0
cmmsxqu9g0005oraglljp9z0w	3	fed40b08-b72f-44c4-99a5-dc937d62e282-3	anthropic/claude-haiku-4.5	4289	47	4336	0.0036192	2026-03-16T08:42:34.036Z	0
cmmsxqsdi0001idolm9wibbpi	49	11891ed6-200c-4f8e-b1d3-6afcc0aa3668-58	anthropic/claude-haiku-4.5	6644	904	7548	0.0089312	2026-03-16T08:42:31.590Z	0
cmmsxqrhz0001yvm0jxy3m5ma	\N	fed40b08-b72f-44c4-99a5-dc937d62e282-3	openai/gpt-4o	608	150	758	0.00302	2026-03-16T08:42:30.455Z	0
cmmsxqk3k0003orago4pt8xv4	3	fed40b08-b72f-44c4-99a5-dc937d62e282-3	anthropic/claude-haiku-4.5	4124	152	4276	0.0039072	2026-03-16T08:42:20.864Z	0
cmmsxpmyd0001orago0ooa1hn	3	fed40b08-b72f-44c4-99a5-dc937d62e282-3	anthropic/claude-haiku-4.5	4081	32	4113	0.0033928	2026-03-16T08:41:37.909Z	0
cmmsxp5q400011l0s5wieo1n3	49	f93863f0-dfd8-4c61-b6cb-fa8b7516142f-58	anthropic/claude-haiku-4.5	5411	104	5515	0.0047448	2026-03-16T08:41:15.580Z	0
cmmsx69kd00019b0nffxocn9t	\N	3fed85fb-7839-4fc0-9046-f283d212a9b5-56	openai/gpt-4o	611	73	684	0.0022575	2026-03-16T08:26:34.093Z	0
cmmsx62td0001fg2olg2w3g66	47	3fed85fb-7839-4fc0-9046-f283d212a9b5-56	anthropic/claude-haiku-4.5	3859	351	4210	0.0044912	2026-03-16T08:26:25.345Z	0
cmmsx4u8w0001w9mfm4w6imlq	\N	37be04a9-a414-4fc7-9fa8-7894d045cdab	openai/gpt-4o	611	109	720	0.0026175	2026-03-16T08:25:27.584Z	0
cmmsx4moh000312xtw9qja2n3	89	37be04a9-a414-4fc7-9fa8-7894d045cdab	anthropic/claude-haiku-4.5	7107	373	7480	0.007177599999999999	2026-03-16T08:25:17.777Z	0
cmmsx388y000112xt0jk6jcw5	89	37be04a9-a414-4fc7-9fa8-7894d045cdab	anthropic/claude-haiku-4.5	3815	33	3848	0.003184	2026-03-16T08:24:12.418Z	0
cmmsw89tr00017oo0mqs33bre	83	dd752ef6-fceb-46e3-9435-5bd24c0e25e2	anthropic/claude-haiku-4.5	3823	312	4135	0.0043064	2026-03-16T08:00:08.127Z	0
cmmsvlxrp00011wjlcijabhhh	\N	84ca4d71-88e0-4124-9fdf-e3ae658877d7-66	openai/gpt-4o	713	167	880	0.0034525	2026-03-16T07:42:46.069Z	0
cmmsvlpvx0003ssbffwqw6ecm	57	84ca4d71-88e0-4124-9fdf-e3ae658877d7-66	anthropic/claude-haiku-4.5	6699	917	7616	0.009027199999999999	2026-03-16T07:42:35.853Z	0
cmmsvlly300031497c65d4wwa	25	43d9f6e5-95c6-470a-9ab4-b432eafd7c4b-32	anthropic/claude-haiku-4.5	6016	680	6696	0.007532799999999999	2026-03-16T07:42:30.747Z	0
cmmsvku8n0001orty901luge2	\N	84ca4d71-88e0-4124-9fdf-e3ae658877d7-66	openai/gpt-4o	607	120	727	0.0027175	2026-03-16T07:41:54.839Z	0
cmmsvkn8d0001ssbfn1a0zxhx	57	84ca4d71-88e0-4124-9fdf-e3ae658877d7-66	anthropic/claude-haiku-4.5	3853	225	4078	0.0039824	2026-03-16T07:41:45.757Z	0
cmmsvk7y40001149701vrntcr	25	43d9f6e5-95c6-470a-9ab4-b432eafd7c4b-32	anthropic/claude-haiku-4.5	3813	17	3830	0.0031184	2026-03-16T07:41:25.948Z	0
cmmsvbspv0001uyhhzif0fwk9	88	afe9695f-6cb9-4044-ad25-216b7f0ac6c2	anthropic/claude-haiku-4.5	5899	595	6494	0.0070992	2026-03-16T07:34:52.963Z	0
cmma0ny5d0003vvmj6d3otf4b	21	8348d453-b483-4f38-b6e5-b15f918c0d06-26	unknown	1298	3892	5190	0	2026-03-03T02:56:40.609Z	0
cmmtck3ay0001d2dxdmglpe6b	8	282457c4-75f3-4032-993f-17286906c184-11	anthropic/claude-haiku-4.5	4113	182	4295	0.0040184	2026-03-16T15:37:13.402Z	0
cmmtchqv30001i0yvm2t6bi0w	8	4ad3e363-45d5-40f4-88a4-7ca91ed4bfde-11	anthropic/claude-haiku-4.5	4096	243	4339	0.0042488	2026-03-16T15:35:23.967Z	0
cmmtcfga30001es02fdujw33x	\N	f42f6ae7-6094-4cde-be1d-9bda83657e91-11	openai/gpt-4o	754	115	869	0.003035	2026-03-16T15:33:36.939Z	0
cmmtcf89y00032v40cik4nnfd	8	f42f6ae7-6094-4cde-be1d-9bda83657e91-11	anthropic/claude-haiku-4.5	4360	219	4579	0.004364	2026-03-16T15:33:26.566Z	0
cmmtcen0b00012v40d80bioj5	8	f42f6ae7-6094-4cde-be1d-9bda83657e91-11	anthropic/claude-haiku-4.5	4099	236	4335	0.0042232	2026-03-16T15:32:59.003Z	0
cmmskviku000114gbcj42b4i8	49	f93863f0-dfd8-4c61-b6cb-fa8b7516142f-58	anthropic/claude-haiku-4.5	3841	191	4032	0.0038368	2026-03-16T02:42:17.166Z	0
cmmelftp500017mpgo65i5k1v	49	098f9aa2-8c7a-4cc7-9726-ddfb3b8ec5ab-58	google/gemini-2.5-pro	810	2429	3239	0.0253025	2026-03-06T07:49:18.233Z	0
cmmsktb2n000112x26zdt88vz	\N	cc8abbf2-f16b-4fee-9ef4-badcdda7da61-58	openai/gpt-4o	623	123	746	0.0027875	2026-03-16T02:40:34.127Z	0
cmmskt47s000312fklwdoqfic	49	cc8abbf2-f16b-4fee-9ef4-badcdda7da61-58	anthropic/claude-haiku-4.5	4132	102	4234	0.0037136	2026-03-16T02:40:25.240Z	0
cmmsksiq7000112fku4j4az57	49	cc8abbf2-f16b-4fee-9ef4-badcdda7da61-58	anthropic/claude-haiku-4.5	3814	214	4028	0.0039072	2026-03-16T02:39:57.391Z	0
cmmeleq510001rtn2979c1nxg	49	f08c2fde-0ae6-44e6-b6fe-92cf79f4bb6a-58	google/gemini-2.5-pro	956	2867	3823	0.029865	2026-03-06T07:48:26.965Z	0
cmmeleff60001d9blgdcgwxnf	8	a88ee2e8-d045-4869-9b55-1fe9824e2dd5-11	google/gemini-2.5-pro	1917	5751	7668	0.05990625000000001	2026-03-06T07:48:13.074Z	0
cmmel8rxi0001yv1kl65iemy9	49	0ec39b41-7a28-4f1b-8447-2151551dfb70-58	google/gemini-2.5-pro	1095	3284	4379	0.03420875	2026-03-06T07:43:49.350Z	0
cmmsjs6h80001ags8qu8gc0q9	83	c9d7f1d9-3e11-43fb-9391-2727cb137b9f	anthropic/claude-haiku-4.5	3822	203	4025	0.0038696	2026-03-16T02:11:41.900Z	0
cmmsiyknw0001lax8we623w0s	\N	61f1aa66-1e32-4bda-9ad5-61b8ce727084-58	openai/gpt-4o	640	105	745	0.00265	2026-03-16T01:48:40.604Z	0
cmmsiydo20003k5fmf2m8k1ow	49	61f1aa66-1e32-4bda-9ad5-61b8ce727084-58	anthropic/claude-haiku-4.5	5159	351	5510	0.0055312	2026-03-16T01:48:31.538Z	0
cmmsivg0t0001k5fmsg6ajno9	49	61f1aa66-1e32-4bda-9ad5-61b8ce727084-58	anthropic/claude-haiku-4.5	3818	207	4025	0.003882399999999999	2026-03-16T01:46:14.621Z	0
cmmekytao0001o1i4z22ajw23	49	7ecaba0e-3acb-418c-9abf-51b8d8025ea5-58	google/gemini-2.5-pro	878	2633	3511	0.0274275	2026-03-06T07:36:04.560Z	0
cmmsiuq4r000110lgrawudkpj	49	3922782d-b7f4-4471-b701-a29f0c225d06-58	anthropic/claude-haiku-4.5	3812	36	3848	0.0031936	2026-03-16T01:45:41.067Z	0
cmmejtd8t0001pszqbkhsjd0q	8	cd718210-3e32-46c9-b960-f0691200f17c-11	google/gemini-2.5-pro	1439	4317	5756	0.04496875000000001	2026-03-06T07:03:50.861Z	0
cmmsgyphd0001e4np98yn1lv1	85	de8addb1-b76d-4f5b-b7c9-a515b62f3121	anthropic/claude-haiku-4.5	3813	41	3854	0.0032144	2026-03-16T00:52:47.617Z	0
cmmsgyerc0001bw6vw6gc0u5i	3	f79567ed-e596-4b64-b2d5-0e59f1303e96-3	anthropic/claude-haiku-4.5	3812	36	3848	0.0031936	2026-03-16T00:52:33.720Z	0
cmmsgmk1t000110tdtu2qg4lt	83	3ea5ab5d-b26c-4e66-b48d-1b834e078e2a	anthropic/claude-haiku-4.5	3818	109	3927	0.003490399999999999	2026-03-16T00:43:20.705Z	0
cmms221fe0001uv675ppdrvv5	\N	38d2a898-5c0f-4203-a127-a523cdb510bc-36	openai/gpt-4o	651	123	774	0.0028575	2026-03-15T17:55:28.826Z	0
cmms21t800003c7ukklg18y9a	29	38d2a898-5c0f-4203-a127-a523cdb510bc-36	anthropic/claude-haiku-4.5	5078	594	5672	0.0064384	2026-03-15T17:55:18.192Z	0
cmms21hk20001c7uk0rroatl0	29	38d2a898-5c0f-4203-a127-a523cdb510bc-36	anthropic/claude-haiku-4.5	3816	321	4137	0.0043368	2026-03-15T17:55:03.074Z	0
cmmrgl9rt0001138x165f1eku	80	fbc4567e-88b9-4b83-a4af-2cbcd0483ed0	anthropic/claude-haiku-4.5	6704	704	7408	0.0081792	2026-03-15T07:54:34.553Z	0
cmmrg8v7c0001vg1m5qw21x9z	79	4c2d2450-398f-4bd6-b034-9bcdfdd5c4a0	anthropic/claude-haiku-4.5	3813	17	3830	0.0031184	2026-03-15T07:44:55.800Z	0
cmmrg7kon0001d95nrbfnuvyp	79	596157bc-08a7-4767-a747-8a1302e71214	anthropic/claude-haiku-4.5	3813	17	3830	0.0031184	2026-03-15T07:43:55.511Z	0
cmmejlmm70001djpi6u52vm2z	8	21399376-98c5-4fba-9c96-76ad0cd9abd5-11	google/gemini-2.5-pro	1706	5116	6822	0.05329250000000001	2026-03-06T06:57:49.759Z	0
cmmejkbig0001mu03kntpymdu	8	a09f1723-7c4e-404e-884d-d9b4c1f46b3b-11	google/gemini-2.5-pro	1419	4258	5677	0.04435375	2026-03-06T06:56:48.712Z	0
cmmeiqcfk0001jrjfqnc8olxt	8	ccf109f2-a7e0-43b9-b46f-4bc13ea449d7-11	google/gemini-2.5-pro	700	2101	2801	0.021885	2026-03-06T06:33:30.224Z	0
cmmeie1030001sas5aueisot7	8	579920a7-2fad-4c22-b817-98056f44dd64-11	google/gemini-2.5-pro	863	2587	3450	0.02694875	2026-03-06T06:23:55.539Z	0
cmmei74l30001c8tscb9vzg90	8	75674473-7e00-4de8-930d-f2e804fcf17e-11	google/gemini-2.5-pro	617	1849	2466	0.01926125	2026-03-06T06:18:33.591Z	0
cmmei3kjz0001s3stquywj0qh	49	67e67c88-076b-42ac-9246-be240d099e68-58	google/gemini-2.5-pro	2772	8315	11087	0.086615	2026-03-06T06:15:47.663Z	0
cmmei11gs0001tsyubtqu7yab	8	46cc766c-9f50-43e2-a9b8-46827dedd7ce	google/gemini-2.5-pro	1147	3441	4588	0.03584375	2026-03-06T06:13:49.612Z	0
cmmehney50001eik9gn8twgkr	8	5edde35a-d773-4d28-bd48-dd2cff6af96d-11	google/gemini-2.5-pro	696	2089	2785	0.02176	2026-03-06T06:03:13.901Z	0
cmmehfkjd00013ubaj6piose0	49	81c7189d-cf3e-47e3-8c6d-31c93eba158e-58	google/gemini-2.5-pro	1260	3781	5041	0.039385	2026-03-06T05:57:07.897Z	0
cmmehdjy90001xjxvxxxfskqg	8	af753fb8-0908-48f1-a8a5-95a46deb33a4-11	google/gemini-2.5-pro	704	2112	2816	0.022	2026-03-06T05:55:33.825Z	0
cmmeh6sdi0001kbsjep6f1o19	49	f61aac00-66a2-4f42-9558-95e65daf4aaa-58	google/gemini-2.5-pro	1171	3513	4684	0.03659375	2026-03-06T05:50:18.150Z	0
cmmeh2tuk0001jnnhbqqio36n	49	3da953a6-1505-4b9e-9448-6ecdbe556f0b-58	google/gemini-2.5-pro	1961	5883	7844	0.06128125000000001	2026-03-06T05:47:13.436Z	0
cmmegjb0e000114b7kpea1n9d	49	9aa85ab2-41e8-4e31-a668-74e438d39031-58	google/gemini-2.5-pro	2543	7628	10171	0.07945875	2026-03-06T05:32:02.558Z	0
cmmsrmq79000179lcfejhfbax	25	7f004015-25df-4ae7-85bc-2ce0a57daa1b-32	anthropic/claude-haiku-4.5	3815	33	3848	0.003184	2026-03-16T05:51:24.453Z	0
cmmsrm6ee0001n9t5iq6tj6jj	57	2dbd2444-4080-42e0-bd23-090e1e6a5893-66	anthropic/claude-haiku-4.5	3848	17	3865	0.0031464	2026-03-16T05:50:58.790Z	0
cmmsrhh4800014l4xkk17p7lz	57	2dbd2444-4080-42e0-bd23-090e1e6a5893-66	anthropic/claude-haiku-4.5	3812	32	3844	0.0031776	2026-03-16T05:47:19.400Z	0
cmmsl1ny70001rwz9o60dzvt0	\N	5d923e7c-eba4-4e2d-8098-1c6047f9c1a1	openai/gpt-4o	607	101	708	0.0025275	2026-03-16T02:47:04.063Z	0
cmmsl1fb50003j4geucvwtj7v	85	5d923e7c-eba4-4e2d-8098-1c6047f9c1a1	anthropic/claude-haiku-4.5	3853	49	3902	0.0032784	2026-03-16T02:46:52.865Z	0
cmmsl13ns0001j4gem0uynkst	85	5d923e7c-eba4-4e2d-8098-1c6047f9c1a1	anthropic/claude-haiku-4.5	3812	35	3847	0.0031896	2026-03-16T02:46:37.768Z	0
cmmef6wnd0001zfjfa0ewp99p	8	f91a6329-e24b-4f19-bb94-fad4d8aec890-11	google/gemini-2.5-pro	710	2129	2839	0.0221775	2026-03-06T04:54:24.457Z	0
cmmef60wb0001lkvdk7fsytpn	8	fd86cc7c-acf8-43e4-88ad-f176c1572e71-11	google/gemini-2.5-pro	717	2151	2868	0.02240625	2026-03-06T04:53:43.307Z	0
cmmeewnpv0001o609lr9khx6x	8	fe61a07c-5b18-4ae2-afcb-44d7e60f6dba-11	google/gemini-2.5-pro	1315	3944	5259	0.04108375	2026-03-06T04:46:26.323Z	0
cmmee8rsw000175ztj5ulssuy	8	79571ea9-9447-4f67-a4f5-8ffde8465989-11	google/gemini-2.5-pro	1369	4106	5475	0.04277125	2026-03-06T04:27:51.872Z	0
cmmee6fc90001812fnevp81ae	8	1f54ec7e-d007-481b-b5f6-f419bf8820f2-11	google/gemini-2.5-pro	837	2509	3346	0.02613625	2026-03-06T04:26:02.409Z	0
cmmee4tsn0001lkqwvxovjjcs	8	1c60e460-53f8-4412-9cd7-71c0bad8d179-11	google/gemini-2.5-pro	627	1881	2508	0.01959375	2026-03-06T04:24:47.831Z	0
cmmed6fus0001uzjy9daz730d	8	a8bcfd0f-4a53-43f2-a4fc-1926204cb908-11	google/gemini-2.5-pro	799	2397	3196	0.02496875	2026-03-06T03:58:03.460Z	0
cmmecxvp40001v5u9x8c6akib	8	7694fcbd-4a8e-4448-9587-bbc98c5549c0-11	google/gemini-2.5-pro	754	2263	3017	0.0235725	2026-03-06T03:51:24.088Z	0
cmmecrmvt0001sdcvfz3mi6jl	8	9da12150-51fb-42db-8874-fac4860c408a-11	google/gemini-2.5-pro	619	1857	2476	0.01934375	2026-03-06T03:46:32.729Z	0
cmmecfon70001d7ppeadflw7i	8	b26189c3-e86f-429c-b849-53b420cdcac4-11	google/gemini-2.5-pro	727	2181	2908	0.02271875	2026-03-06T03:37:15.139Z	0
cmmec8w9o000160xksorau7da	8	0d210f1a-db24-42c3-a94e-d27d703962c7-11	google/gemini-2.5-pro	2106	6319	8425	0.0658225	2026-03-06T03:31:58.428Z	0
cmmec3p810001jaht4b4be01g	8	7a7039b7-05b0-4fcc-887f-ea259e996f75-11	google/gemini-2.5-pro	2704	8112	10816	0.0845	2026-03-06T03:27:56.017Z	0
cmmec2e5z000112wifqxejqod	8	82e64c18-1686-4b6b-85b8-ed0e5e9c3dc5-11	google/gemini-2.5-pro	732	2196	2928	0.022875	2026-03-06T03:26:55.031Z	0
cmmec1r6t00013nponymmj56t	8	c1cb510e-3b7b-4ec4-871d-27d5f31f7a4a-11	google/gemini-2.5-pro	717	2150	2867	0.02239625	2026-03-06T03:26:25.253Z	0
cmmebypz90001iuzkjuwmxjzs	8	988329b0-5e80-4520-86fd-86a69349701e-11	google/gemini-2.5-pro	2398	7195	9593	0.0749475	2026-03-06T03:24:03.717Z	0
cmmebyc7h0001h6pxoln36xih	49	833b28fd-750e-4df8-8829-f75bbfd70325-58	google/gemini-2.5-pro	1907	5719	7626	0.05957375	2026-03-06T03:23:45.869Z	0
cmmebvik40001xabv98elxhvy	8	1feabe34-3dbc-4074-83ef-89f1dea23311-11	google/gemini-2.5-pro	1190	3570	4760	0.03718750000000001	2026-03-06T03:21:34.132Z	0
cmmebu2ja0001h2e50gicnc5l	8	f7e7e9ae-32f8-48f8-94ce-4c6bc22ed5eb-11	google/gemini-2.5-pro	1264	3792	5056	0.0395	2026-03-06T03:20:26.710Z	0
cmmeal4kl0001fyfoqw8cwim5	8	9dcf3418-4069-4dde-b0cd-e7834429f61e-11	google/gemini-2.5-pro	944	2831	3775	0.02949	2026-03-06T02:45:29.829Z	0
cmmeakq1100011axyr0b4wuty	8	ee16b111-0e55-4f98-929b-a6da41e0ba4e-11	google/gemini-2.5-pro	855	2563	3418	0.02669875	2026-03-06T02:45:10.981Z	0
cmmea7m510001ylq2c2vynfxr	8	f3047adc-a858-4843-928a-1aa95a4836f3-11	google/gemini-2.5-pro	1059	3177	4236	0.03309375	2026-03-06T02:34:59.413Z	0
cmmea6vj50001f5htq27i63iv	8	cda62c92-0552-4e25-a297-fa55f8ff77fd-11	google/gemini-2.5-pro	789	2365	3154	0.02463625	2026-03-06T02:34:24.929Z	0
cmmea5fxm0001b1fw70m0lw96	8	dc889b75-b46f-4b0e-9a0c-e159042ea48a-11	google/gemini-2.5-pro	800	2399	3199	0.02499	2026-03-06T02:33:18.058Z	0
cmmea201b0005l3ovtlxgeg42	49	4077faa2-074b-40b4-8fcb-ffef5d11f0ff-58	google/gemini-2.5-pro	1302	3904	5206	0.0406675	2026-03-06T02:30:37.487Z	0
cmmea0rmm0003l3ovexyiymn0	49	4077faa2-074b-40b4-8fcb-ffef5d11f0ff-58	google/gemini-2.5-pro	936	2808	3744	0.02925	2026-03-06T02:29:39.934Z	0
cmmea096s0001l3ovszibtzgo	49	4077faa2-074b-40b4-8fcb-ffef5d11f0ff-58	google/gemini-2.5-pro	896	2686	3582	0.02798	2026-03-06T02:29:16.036Z	0
cmme9y5bp000d10ec92hqdvxu	49	fbeec7cc-042f-4c5f-849a-6de436c40365-58	google/gemini-2.5-pro	1112	3337	4449	0.03476000000000001	2026-03-06T02:27:37.717Z	0
cmme9wvdo000b10eclhsxrszx	49	fbeec7cc-042f-4c5f-849a-6de436c40365-58	google/gemini-2.5-pro	614	1841	2455	0.0191775	2026-03-06T02:26:38.172Z	0
cmme9uqk4000910ecozp6ej1e	49	cc05f9a9-b1e1-4dcf-adb9-db1e5982b1b3-58	google/gemini-2.5-pro	0	0	0	0	2026-03-06T02:24:58.612Z	0
cmme9hj1b0001kx4paigcg1ib	8	ea5da61b-6c67-45ba-82ba-8b01edd6a08a-11	google/gemini-2.5-pro	1032	3095	4127	0.03224	2026-03-06T02:14:42.335Z	0
cmme9gwfi0001lqxp7224ovsg	8	d9a61e43-fb9d-4eac-930a-fe2580f75683-11	google/gemini-2.5-pro	704	2110	2814	0.02198	2026-03-06T02:14:13.038Z	0
cmme9ghdg000710ec8bjfew4w	49	cc05f9a9-b1e1-4dcf-adb9-db1e5982b1b3-58	google/gemini-2.5-pro	1196	3589	4785	0.03738500000000001	2026-03-06T02:13:53.524Z	0
cmme9fu6v000510ecw2kye9ax	49	cc05f9a9-b1e1-4dcf-adb9-db1e5982b1b3-58	google/gemini-2.5-pro	1123	3370	4493	0.03510375	2026-03-06T02:13:23.479Z	0
cmme9ekye000310ecozyhfec5	49	cc05f9a9-b1e1-4dcf-adb9-db1e5982b1b3-58	google/gemini-2.5-pro	1357	4070	5427	0.04239625	2026-03-06T02:12:24.854Z	0
cmme9ebpi0001qozlgtzuiswc	8	59320451-6ad1-4fc3-8552-f1edde0b750a-11	google/gemini-2.5-pro	896	2688	3584	0.028	2026-03-06T02:12:12.870Z	0
cmme9dnfg000110ecyczavzkl	49	cc05f9a9-b1e1-4dcf-adb9-db1e5982b1b3-58	google/gemini-2.5-pro	1069	3205	4274	0.03338625	2026-03-06T02:11:41.404Z	0
cmme9c2z50001tugyjmh0763q	8	a1f110f4-3321-4d83-b894-84f663f8803a-11	google/gemini-2.5-pro	745	2233	2978	0.02326125	2026-03-06T02:10:28.241Z	0
cmmefn4dw0001r55j5hae7q31	8	718be036-be02-49f9-90a9-66cae644b869-11	google/gemini-2.5-pro	779	2338	3117	0.02435375	2026-03-06T05:07:00.980Z	0
cmmefiil70001114sti5owc6b	8	8d70ae8f-fa80-494e-a0e3-5ec9f05a7dae-11	google/gemini-2.5-pro	698	2092	2790	0.0217925	2026-03-06T05:03:26.107Z	0
cmmefhy7y0001xfteukfhwx9b	8	24bbb471-5a7a-4c15-9757-0cde6ffe5de8-11	google/gemini-2.5-pro	731	2193	2924	0.02284375	2026-03-06T05:02:59.710Z	0
cmmef95qi0001rkbcb03sz4nt	8	b77ad64e-cb41-4aba-8194-4ac4e6e850c7-11	google/gemini-2.5-pro	813	2437	3250	0.02538625	2026-03-06T04:56:09.546Z	0
cmmef83hd0003lkvdhe0jtbm7	8	fd86cc7c-acf8-43e4-88ad-f176c1572e71-11	google/gemini-2.5-pro	725	2175	2900	0.02265625	2026-03-06T04:55:19.969Z	0
cmmef7g8y0001a012uuszvt10	8	4af711c0-712a-4019-ac92-d990db2e2bc2-11	google/gemini-2.5-pro	788	2363	3151	0.024615	2026-03-06T04:54:49.858Z	0
cmmd9us2x0001l88iqi0gx798	42	09a4d63b-9c62-44bd-94db-32406ab23f7d-49	google/gemini-2.5-pro	855	2565	3420	0.02671875	2026-03-05T09:37:14.409Z	0
cmmd9tvrp0005d56amdz7caxn	42	89705815-1bc4-4229-90f1-930903450885-49	google/gemini-2.5-pro	1160	3478	4638	0.03623000000000001	2026-03-05T09:36:32.533Z	0
cmmd9svvo0003d56aqqeit31n	42	89705815-1bc4-4229-90f1-930903450885-49	google/gemini-2.5-pro	905	2715	3620	0.02828125	2026-03-05T09:35:46.020Z	0
cmmd9snzw0001d56aity4g1kl	42	89705815-1bc4-4229-90f1-930903450885-49	google/gemini-2.5-pro	901	2703	3604	0.02815625	2026-03-05T09:35:35.804Z	0
cmmd9i15g0001u28xxlkfcq1n	49	9bd8e4fd-ce4a-46ad-b95f-20a7bc1ae517-58	google/gemini-2.5-pro	1000	2999	3999	0.03124	2026-03-05T09:27:19.636Z	0
cmmd985ey0001p13px52mdjba	49	7b6a098f-e97f-4049-a43d-15ef3509fe1a-58	google/gemini-2.5-pro	952	2856	3808	0.02975	2026-03-05T09:19:38.602Z	0
cmmd97ifa000dlhas9u0xmcsh	42	7192e791-af66-455c-a63e-72b83c0ce91b-49	google/gemini-2.5-pro	1285	3856	5141	0.04016625	2026-03-05T09:19:08.806Z	0
cmmd97ba2000blhasww0h2ydu	42	7192e791-af66-455c-a63e-72b83c0ce91b-49	google/gemini-2.5-pro	1281	3844	5125	0.04004125	2026-03-05T09:18:59.546Z	0
cmmd976mj0009lhas91xunuym	42	7192e791-af66-455c-a63e-72b83c0ce91b-49	google/gemini-2.5-pro	1273	3817	5090	0.03976125	2026-03-05T09:18:53.515Z	0
cmmd9716s0007lhasvxrth9gy	42	7192e791-af66-455c-a63e-72b83c0ce91b-49	google/gemini-2.5-pro	1266	3797	5063	0.0395525	2026-03-05T09:18:46.468Z	0
cmmd96gt10005lhaspn4g5wri	42	7192e791-af66-455c-a63e-72b83c0ce91b-49	google/gemini-2.5-pro	1260	3779	5039	0.039365	2026-03-05T09:18:20.053Z	0
cmmd951p20003lhas5e50btsp	42	7192e791-af66-455c-a63e-72b83c0ce91b-49	google/gemini-2.5-pro	1303	3907	5210	0.04069875	2026-03-05T09:17:13.814Z	0
cmmd94vkv0001lhaswnnkyafz	42	7192e791-af66-455c-a63e-72b83c0ce91b-49	google/gemini-2.5-pro	1391	4172	5563	0.04345875	2026-03-05T09:17:05.887Z	0
cmmd90new0001139ecq4236jp	49	057e4f4a-c30b-4f73-a1b6-c50a4a3bd38d-58	google/gemini-2.5-pro	1270	3809	5079	0.0396775	2026-03-05T09:13:48.680Z	0
cmmd8zecr000113ulzzcu5i08	49	22018f62-fb4d-4656-9501-b16a67997f9e-58	google/gemini-2.5-pro	1392	4175	5567	0.04349	2026-03-05T09:12:50.283Z	0
cmmd81alk0003gm8km5bblqtm	49	44792db7-4d7b-4df4-a97a-30eaf8b42b55-58	google/gemini-2.5-pro	1212	3634	4846	0.03785500000000001	2026-03-05T08:46:19.112Z	0
cmmd7zm6x0001gm8kl1htlxeb	49	44792db7-4d7b-4df4-a97a-30eaf8b42b55-58	google/gemini-2.5-pro	752	2256	3008	0.0235	2026-03-05T08:45:00.825Z	0
cmmd7ycyc0005ri7a9csgfisp	49	c3d80f44-0a2f-4794-beaf-0171a0a59536-58	google/gemini-2.5-pro	1826	5478	7304	0.0570625	2026-03-05T08:44:02.196Z	0
cmmd7wnzo0003ri7at3ifks8n	49	c3d80f44-0a2f-4794-beaf-0171a0a59536-58	google/gemini-2.5-pro	1611	4834	6445	0.05035375	2026-03-05T08:42:43.188Z	0
cmmd7v3f00001ri7ag45olzla	49	c3d80f44-0a2f-4794-beaf-0171a0a59536-58	google/gemini-2.5-pro	1097	3292	4389	0.03429125	2026-03-05T08:41:29.868Z	0
cmmd7r3es0001ajj2hu2eu3a4	8	38895dc3-c0c3-4f92-a5f7-82ab9ff9cbcc-11	google/gemini-2.5-pro	915	2745	3660	0.02859375	2026-03-05T08:38:23.236Z	0
cmmd7qoei0003by32souv4nmi	47	3c5af01a-620e-40cc-a01b-da30a3cae6a4-56	google/gemini-2.5-pro	1717	5151	6868	0.05365625000000001	2026-03-05T08:38:03.786Z	0
cmmd7q90m00015dwmmpclafb5	8	525b6831-d353-4995-8d02-bdc4c653f45c-11	google/gemini-2.5-pro	1233	3700	4933	0.03854125000000001	2026-03-05T08:37:43.846Z	0
cmmd7pi0l0001vu54bdhrsmok	8	607a69c7-fa39-47cd-b83a-5dc09bff8400-11	google/gemini-2.5-pro	1317	3950	5267	0.04114625	2026-03-05T08:37:08.853Z	0
cmmd7pfol0001by32yjdk553v	47	3c5af01a-620e-40cc-a01b-da30a3cae6a4-56	google/gemini-2.5-pro	1601	4802	6403	0.05002125000000001	2026-03-05T08:37:05.829Z	0
cmmd7n48g0001hcudynv447xy	47	8a9d222d-e473-4dd0-8f78-b5cfff383220-56	google/gemini-2.5-pro	1298	3895	5193	0.0405725	2026-03-05T08:35:17.680Z	0
cmmd7lo6f00035qq1i0pyrhpx	47	9451f0d3-69c8-4c99-87da-165c33166f49-56	google/gemini-2.5-pro	1529	4588	6117	0.04779125000000001	2026-03-05T08:34:10.215Z	0
cmmd7k69200015qq1xuaswhna	47	9451f0d3-69c8-4c99-87da-165c33166f49-56	google/gemini-2.5-pro	1172	3517	4689	0.036635	2026-03-05T08:33:00.326Z	0
cmmd7g6xl0005fgt5eshp6f6x	47	0fe7dac7-17c1-4146-a6d0-97f01eb04a75-56	google/gemini-2.5-pro	1123	3369	4492	0.03509375000000001	2026-03-05T08:29:54.585Z	0
cmmd7fbbq0003fgt5ykmh9ijm	47	0fe7dac7-17c1-4146-a6d0-97f01eb04a75-56	google/gemini-2.5-pro	1013	3038	4051	0.03164625	2026-03-05T08:29:13.622Z	0
cmmd7e4fb0001fgt5gj8hryus	47	0fe7dac7-17c1-4146-a6d0-97f01eb04a75-56	google/gemini-2.5-pro	815	2443	3258	0.02544875	2026-03-05T08:28:18.023Z	0
cmmd7drqz000313x5dlby07z7	49	8860c428-bcf3-4991-9112-23fe464dc9a1-58	google/gemini-2.5-pro	1292	3876	5168	0.040375	2026-03-05T08:28:01.595Z	0
cmmd7cvvd0001fubrkud7dfms	8	8417dc9c-06da-4436-ad62-1b65c883dde4-11	google/gemini-2.5-pro	752	2255	3007	0.02349	2026-03-05T08:27:20.281Z	0
cmmd7bc5w0003dpyz513oae7y	8	95a2e0e2-602d-4099-a526-335b9d64c04a	google/gemini-2.5-pro	1205	3615	4820	0.03765625	2026-03-05T08:26:08.084Z	0
cmmd7afcd0001dpyzzp6n5jgi	8	95a2e0e2-602d-4099-a526-335b9d64c04a	google/gemini-2.5-pro	1053	3160	4213	0.03291625	2026-03-05T08:25:25.549Z	0
cmmd79xsk000113x5t2wqjbyh	49	8860c428-bcf3-4991-9112-23fe464dc9a1-58	google/gemini-2.5-pro	1149	3448	4597	0.03591625	2026-03-05T08:25:02.804Z	0
cmmd77u6800019o46a0fqpckb	49	898d07ca-5abb-4501-b95e-5759279aee98-58	google/gemini-2.5-pro	1442	4327	5769	0.0450725	2026-03-05T08:23:24.800Z	0
cmme81ezn000199x9zzwd2jd8	8	9add8997-6545-4c71-86be-9c35f18233da-11	google/gemini-2.5-pro	1165	3493	4658	0.03638625	2026-03-06T01:34:10.979Z	0
cmmdnoqg90001s64gzinntqx1	47	9841835c-10fc-4ecb-8cc6-a9aa737237dd-56	google/gemini-2.5-pro	1540	4619	6159	0.048115	2026-03-05T16:04:26.985Z	0
cmmdc8hb90003vu543o5b67z9	8	607a69c7-fa39-47cd-b83a-5dc09bff8400-11	google/gemini-2.5-pro	1371	4111	5482	0.04282375	2026-03-05T10:43:52.869Z	0
cmmdadlwb00039m9cmqdrx0jq	49	a6ea35dc-a7c4-4bdb-b53b-454da2779b7b-58	google/gemini-2.5-pro	2302	6907	9209	0.07194750000000001	2026-03-05T09:51:52.859Z	0
cmmdacc7f00019m9cdwdqnpfr	49	a6ea35dc-a7c4-4bdb-b53b-454da2779b7b-58	google/gemini-2.5-pro	0	0	0	0	2026-03-05T09:50:53.643Z	0
cmmd9v80y0003l88iluqgbis0	42	09a4d63b-9c62-44bd-94db-32406ab23f7d-49	google/gemini-2.5-pro	854	2563	3417	0.0266975	2026-03-05T09:37:35.074Z	0
cmmd4w4ds0001fxnqeckz6o4p	8	9add8997-6545-4c71-86be-9c35f18233da-11	google/gemini-2.5-pro	976	2929	3905	0.03051	2026-03-05T07:18:18.928Z	0
cmmd4ublt0001x2lqlgihwxg6	49	3547d743-bf1f-40de-a1de-581b19f5bbb8-58	google/gemini-2.5-pro	1199	3597	4796	0.03746875	2026-03-05T07:16:54.977Z	0
cmmd4tkuf00053g9j4nzdl52a	8	4bf5f4c8-56f3-4272-b9bb-68ebb3fd69ab-11	google/gemini-2.5-pro	1085	3256	4341	0.03391625000000001	2026-03-05T07:16:20.295Z	0
cmmd4rsrp00033g9j3yaayj6v	8	4bf5f4c8-56f3-4272-b9bb-68ebb3fd69ab-11	google/gemini-2.5-pro	1119	3355	4474	0.03494875	2026-03-05T07:14:57.253Z	0
cmmd4qy1m000111mztmtospns	49	be616767-c826-4d47-aea8-64e5ade1f0b0-58	google/gemini-2.5-pro	1158	3475	4633	0.0361975	2026-03-05T07:14:17.434Z	0
cmmd4mep30001luy3rwq19271	49	898d07ca-5abb-4501-b95e-5759279aee98-58	google/gemini-2.5-pro	1264	3790	5054	0.03948	2026-03-05T07:10:45.735Z	0
cmmd4jrjt00013g9jqy17k1x7	8	4bf5f4c8-56f3-4272-b9bb-68ebb3fd69ab-11	google/gemini-2.5-pro	928	2782	3710	0.02898	2026-03-05T07:08:42.425Z	0
cmmd4e1ot00019kepikd5hi43	8	30c1073c-a4b7-4326-bf72-3241b596a0cc-11	google/gemini-2.5-pro	1376	4129	5505	0.04301	2026-03-05T07:04:15.629Z	0
cmmd3uhf400015mj73qx1klj0	49	67d819e7-eb45-4d03-9db7-e58d3b8740ea-58	google/gemini-2.5-pro	990	2968	3958	0.0309175	2026-03-05T06:49:02.896Z	0
cmmd3r0bj0001vahbod1lyhmq	47	6c9afe3a-1d97-4ab6-97be-f805312af352-56	google/gemini-2.5-pro	2747	8239	10986	0.08582375	2026-03-05T06:46:20.767Z	0
cmmcz7o6k0001g4xsq2yxrzxn	49	c3d80f44-0a2f-4794-beaf-0171a0a59536-58	google/gemini-2.5-pro	1104	3310	4414	0.03448	2026-03-05T04:39:20.108Z	0
cmmcypfzi0001knltmtc17er8	8	f4bd31d9-5480-4f39-8bf3-8d0ea9226abf-11	google/gemini-2.5-pro	1175	3525	4700	0.03671875	2026-03-05T04:25:09.678Z	0
cmmcyb2tv0001sm7jtspieo7h	49	3be0cdf9-bdd6-424b-95db-a4c3eac6d7f8-58	google/gemini-2.5-pro	769	2305	3074	0.02401125	2026-03-05T04:13:59.443Z	0
cmmcwx681000f11u3mrawiumc	47	6c9afe3a-1d97-4ab6-97be-f805312af352-56	google/gemini-2.5-pro	2651	7951	10602	0.08282375000000002	2026-03-05T03:35:11.041Z	0
cmmcwurh6000d11u32e8pm0ax	47	6c9afe3a-1d97-4ab6-97be-f805312af352-56	google/gemini-2.5-pro	2643	7927	10570	0.08257375	2026-03-05T03:33:18.618Z	0
cmmcwt3lu000b11u370isqo66	47	6c9afe3a-1d97-4ab6-97be-f805312af352-56	google/gemini-2.5-pro	1986	5959	7945	0.0620725	2026-03-05T03:32:01.026Z	0
cmmcwrbiu000911u3v5tv3s72	47	6c9afe3a-1d97-4ab6-97be-f805312af352-56	google/gemini-2.5-pro	1770	5308	7078	0.0552925	2026-03-05T03:30:37.974Z	0
cmmcwo8z9000711u3xlkozp4q	47	6c9afe3a-1d97-4ab6-97be-f805312af352-56	google/gemini-2.5-pro	1781	5342	7123	0.05564625	2026-03-05T03:28:14.709Z	0
cmmcwlrh0000511u3vkuvrdqo	47	6c9afe3a-1d97-4ab6-97be-f805312af352-56	google/gemini-2.5-pro	1873	5618	7491	0.05852125000000001	2026-03-05T03:26:18.708Z	0
cmmcwkfwx000311u3qy3nrl2p	47	6c9afe3a-1d97-4ab6-97be-f805312af352-56	google/gemini-2.5-pro	1420	4258	5678	0.04435500000000001	2026-03-05T03:25:17.073Z	0
cmmcwivlk0001346w7bsnpv0l	8	317fb1cf-be76-43a2-bc9f-b8e9812089f3-11	google/gemini-2.5-pro	1440	4318	5758	0.04498000000000001	2026-03-05T03:24:04.088Z	0
cmmcwiqvm000111u3m7powvkc	47	6c9afe3a-1d97-4ab6-97be-f805312af352-56	google/gemini-2.5-pro	1502	4506	6008	0.0469375	2026-03-05T03:23:57.970Z	0
cmmcwba3300016i6ddcvwv357	8	97debda7-b231-4833-93ea-2bea64593c60-11	google/gemini-2.5-pro	721	2161	2882	0.02251125	2026-03-05T03:18:09.615Z	0
cmmcvzc1c00015hf8k84zyo3l	8	2692ec53-a466-4fa3-932c-ab8f8f4515a0-11	google/gemini-2.5-pro	1011	3034	4045	0.03160375	2026-03-05T03:08:52.272Z	0
cmmcvs3nj0001fn60wkxtg126	8	68f02016-d8d7-454c-a63c-e7653358c2e5-11	google/gemini-2.5-pro	945	2834	3779	0.02952125	2026-03-05T03:03:14.815Z	0
cmmcvrzz6000311t2woh51bv0	57	723099bd-5e21-4e74-8e0f-479774e3b8c2-66	google/gemini-2.5-pro	784	2353	3137	0.02451	2026-03-05T03:03:10.050Z	0
cmmcvqu46000111t2efdzux4n	57	723099bd-5e21-4e74-8e0f-479774e3b8c2-66	google/gemini-2.5-pro	747	2239	2986	0.02332375	2026-03-05T03:02:15.798Z	0
cmmcvpnh80003mq6be9fkttuc	49	3be0cdf9-bdd6-424b-95db-a4c3eac6d7f8-58	google/gemini-2.5-pro	748	2244	2992	0.023375	2026-03-05T03:01:20.540Z	0
cmmcvp2pv0001mq6bb5t9nmmq	49	3be0cdf9-bdd6-424b-95db-a4c3eac6d7f8-58	google/gemini-2.5-pro	610	1829	2439	0.0190525	2026-03-05T03:00:53.635Z	0
cmmcvbd7n0001xqsjyd06mmeu	8	7719ed2c-f0cb-46fc-9725-77e6a92f8549-11	google/gemini-2.5-pro	1098	3292	4390	0.0342925	2026-03-05T02:50:14.051Z	0
cmmcva5ms0005quak9s2jeqio	8	02f5263c-5260-4218-b449-c5fa89e27b91-11	google/gemini-2.5-pro	900	2699	3599	0.028115	2026-03-05T02:49:17.572Z	0
cmmcv8ehm0001twqfgyk8njai	57	ef711b43-383f-41e5-8bf5-3a2c97d433c1-66	google/gemini-2.5-pro	988	2962	3950	0.030855	2026-03-05T02:47:55.738Z	0
cmmcv89620003quakvce2in4b	8	02f5263c-5260-4218-b449-c5fa89e27b91-11	google/gemini-2.5-pro	893	2679	3572	0.02790625	2026-03-05T02:47:48.842Z	0
cmmcv714d0001gyyrahcgprlt	57	c4fde939-7776-4702-867e-1313df5e98c0-66	google/gemini-2.5-pro	866	2598	3464	0.0270625	2026-03-05T02:46:51.757Z	0
cmmcv4qtd0001quakpngw24vc	8	02f5263c-5260-4218-b449-c5fa89e27b91-11	google/gemini-2.5-pro	845	2534	3379	0.02639625	2026-03-05T02:45:05.089Z	0
cmmcv0emq0001djk68h17re1g	57	6eaf42f1-d4e1-4494-9c28-ba8b685b5783	google/gemini-2.5-pro	1645	4935	6580	0.05140625000000001	2026-03-05T02:41:42.674Z	0
cmmctfstr0007aq4g5t7g2gaf	49	81645a67-d149-4825-9a1c-8d659fda8de0-58	google/gemini-2.5-pro	1685	5055	6740	0.05265625	2026-03-05T01:57:41.679Z	0
cmmd646rw0001ubdhkgagyz81	8	fcc16c5d-04e5-42d0-ac8f-32582d59eb89-11	google/gemini-2.5-pro	1326	3976	5302	0.0414175	2026-03-05T07:52:34.892Z	0
cmmd62kxu0001qtg6747o8us9	8	7e15bc67-ebcf-4628-80b9-665bae01c72d-11	google/gemini-2.5-pro	1007	3021	4028	0.03146875	2026-03-05T07:51:19.938Z	0
cmmd5yzmc0003pyfe868ovhig	8	9add8997-6545-4c71-86be-9c35f18233da-11	google/gemini-2.5-pro	1048	3145	4193	0.03276	2026-03-05T07:48:32.340Z	0
cmmd5yjpn0001pyfe6277ykpq	8	9add8997-6545-4c71-86be-9c35f18233da-11	google/gemini-2.5-pro	978	2932	3910	0.0305425	2026-03-05T07:48:11.723Z	0
cmmd5iaf600013lvtg8uwftyb	49	c8e9ccec-d47f-4d34-8181-b8db60a2853a-58	google/gemini-2.5-pro	632	1896	2528	0.01975	2026-03-05T07:35:33.186Z	0
cmmd56ke50001z9pzzdlow5dx	49	334d1557-16df-49a6-9b4a-52938a27d6f6-58	google/gemini-2.5-pro	832	2494	3326	0.02598	2026-03-05T07:26:26.237Z	0
cmmbt3s7u0001hosajesr49qe	47	31b1dd23-2c93-464c-a156-c50d72160c53-56	google/gemini-2.5-pro	909	2728	3637	0.02841625	2026-03-04T09:00:34.842Z	0
cmmbszoza0001g7sipgcc24go	57	1a3156db-7835-4d3e-bd3c-61c3017c669f-66	google/gemini-2.5-pro	1274	3822	5096	0.0398125	2026-03-04T08:57:24.022Z	0
cmmbpvjy20003x45d2cr6xbsy	21	0ec2e678-1924-4f3b-b4dd-4c13ecad2969-26	google/gemini-2.5-pro	997	2992	3989	0.03116625	2026-03-04T07:30:12.026Z	0
cmmbpte3c0001x45dnoszy3yr	21	0ec2e678-1924-4f3b-b4dd-4c13ecad2969-26	google/gemini-2.5-pro	1003	3008	4011	0.03133375	2026-03-04T07:28:31.128Z	0
cmmbpf0m10001jlvrma1q08zo	8	71b4326a-ebac-41a1-b9a3-c5ff3ac9319b-11	google/gemini-2.5-pro	1442	4325	5767	0.0450525	2026-03-04T07:17:20.473Z	0
cmmbouzia0007qrebvb21lq8c	57	a57ba900-9495-4660-8f9b-588c6604078f-66	google/gemini-2.5-pro	852	2557	3409	0.026635	2026-03-04T07:01:45.922Z	0
cmmboqhcy0003qrebidprt6ah	57	a57ba900-9495-4660-8f9b-588c6604078f-66	google/gemini-2.5-pro	777	2330	3107	0.02427125	2026-03-04T06:58:15.778Z	0
cmmboo4c90001qreb354tz57f	57	a57ba900-9495-4660-8f9b-588c6604078f-66	google/gemini-2.5-pro	774	2320	3094	0.0241675	2026-03-04T06:56:25.593Z	0
cmmbnmjw600014zxtrvyprsfm	57	a57ba900-9495-4660-8f9b-588c6604078f-66	google/gemini-2.5-pro	777	2330	3107	0.02427125	2026-03-04T06:27:12.822Z	0
cmmbmw8uh0001tj2zg3k2ocxx	47	db282d20-dbfa-4575-bd74-10c9602f83dd-56	google/gemini-2.5-pro	804	2413	3217	0.025135	2026-03-04T06:06:45.449Z	0
cmmbk5gqo00014eehlte15q5j	57	b7d20d7f-7b66-4902-8a96-bf2f43e92999-66	google/gemini-2.5-pro	947	2842	3789	0.02960375	2026-03-04T04:49:56.736Z	0
cmmbgw2sa00012kygktlan0uw	49	ac7b2caa-9bf8-46b9-a9e6-7a8ab3c58432-58	google/gemini-2.5-pro	754	2262	3016	0.0235625	2026-03-04T03:18:39.898Z	0
cmmbgq32w0001gu6kgbjxolu4	49	5cd42c89-a515-432a-ac28-bdeb729b32ef-58	google/gemini-2.5-pro	1074	3222	4296	0.03356250000000001	2026-03-04T03:14:00.344Z	0
cmmbgkk4k0001cv3qvjklaj0e	49	6db6e616-802d-4efd-b8c2-0c621cc1e7ed-58	google/gemini-2.5-pro	1150	3449	4599	0.0359275	2026-03-04T03:09:42.500Z	0
cmmbghimz0001xicsnqfyr6fy	49	9d9d0ee4-406f-4db2-a129-460f7084fe8c-58	google/gemini-2.5-pro	1678	5035	6713	0.05244750000000001	2026-03-04T03:07:20.603Z	0
cmmbgfwtn0001werymy8b8zbl	49	ca376dce-665f-4abb-a8f6-259757b5a5d4-58	google/gemini-2.5-pro	755	2266	3021	0.02360375	2026-03-04T03:06:05.675Z	0
cmmahq1pj0001ddtxkw6olrwp	49	9f3d1618-80f4-44bf-962a-ad80315541b8-58	google/gemini-2.5-pro	1067	3201	4268	0.03334375000000001	2026-03-03T10:54:12.007Z	0
cmmahfkef000711lnvsi1ha44	47	5d21e2ac-2085-44bb-9411-2b0774be6852-56	google/gemini-2.5-pro	1702	5105	6807	0.0531775	2026-03-03T10:46:03.015Z	0
cmmahf0is000511ln2f5tneuu	47	5d21e2ac-2085-44bb-9411-2b0774be6852-56	google/gemini-2.5-pro	1330	3990	5320	0.0415625	2026-03-03T10:45:37.252Z	0
cmmahenmz000311lnawfin0uz	47	5d21e2ac-2085-44bb-9411-2b0774be6852-56	google/gemini-2.5-pro	1166	3497	4663	0.0364275	2026-03-03T10:45:20.555Z	0
cmmahdw7a000111lnfvdvarip	47	5d21e2ac-2085-44bb-9411-2b0774be6852-56	google/gemini-2.5-pro	1161	3481	4642	0.03626125	2026-03-03T10:44:44.998Z	0
cmmah5b4n0001wcxxz2k98w94	47	5d21e2ac-2085-44bb-9411-2b0774be6852-56	google/gemini-2.5-pro	1287	3862	5149	0.04022875	2026-03-03T10:38:04.439Z	0
cmmah3bew0003gv2h2tj42xcm	47	22e494f6-3b0a-4314-bcfd-2b9d23f914c8-56	google/gemini-2.5-pro	1450	4351	5801	0.04532250000000001	2026-03-03T10:36:31.496Z	0
cmmah2kfu0001gv2hav6j36e0	47	22e494f6-3b0a-4314-bcfd-2b9d23f914c8-56	google/gemini-2.5-pro	1455	4364	5819	0.04545875000000001	2026-03-03T10:35:56.538Z	0
cmmagywvc0003worxto25vfwb	47	ab986a84-228a-4609-ab04-de899ac0a205-56	google/gemini-2.5-pro	918	2755	3673	0.0286975	2026-03-03T10:33:06.024Z	0
cmmagri0r0001worx8nli8ao1	47	ab986a84-228a-4609-ab04-de899ac0a205-56	google/gemini-2.5-pro	913	2738	3651	0.02852125	2026-03-03T10:27:20.187Z	0
cmmad3k8s00013boki5fx03wk	8	840f1a98-6719-4bf3-8d15-8e36250225c6-11	google/gemini-2.5-pro	2091	6273	8364	0.06534375	2026-03-03T08:44:44.476Z	0
cmma12wuz0003ch5z7goqukcd	6	78d67cc5-c22a-4fdd-a357-3c21cd04cc8e-9	google/gemini-2.5-pro	700	2098	2798	0	2026-03-03T03:08:18.779Z	0
cmma12ltv0001ch5zu2p6miad	6	78d67cc5-c22a-4fdd-a357-3c21cd04cc8e-9	google/gemini-2.5-pro	645	1933	2578	0	2026-03-03T03:08:04.483Z	0
cmma0zx9z0001xz2wv62plgkk	8	df444db5-e173-496c-8a61-b0456b5e21ef-11	unknown	1314	3941	5255	0	2026-03-03T03:05:59.351Z	0
cmma0ya5x000bbd33rfhld3km	8	965af657-b8e1-4b16-b1bf-5a3046ad9869-11	unknown	1748	5245	6993	0	2026-03-03T03:04:42.741Z	0
cmma0wj1p00012w6io22n51e7	57	dc1ff02b-cffb-41e3-8f2d-783b798b5708-66	unknown	648	1942	2590	0	2026-03-03T03:03:20.941Z	0
cmma0uq710009bd33mi6v9vge	8	965af657-b8e1-4b16-b1bf-5a3046ad9869-11	unknown	1708	5123	6831	0	2026-03-03T03:01:56.893Z	0
cmma0u7n50007bd33f92r6zgy	8	965af657-b8e1-4b16-b1bf-5a3046ad9869-11	unknown	1695	5083	6778	0	2026-03-03T03:01:32.849Z	0
cmma0t0bx0005bd33g1v92xqn	8	965af657-b8e1-4b16-b1bf-5a3046ad9869-11	unknown	1565	4696	6261	0	2026-03-03T03:00:36.717Z	0
cmma0rgot0003bd332kyjnp3b	8	965af657-b8e1-4b16-b1bf-5a3046ad9869-11	unknown	1450	4351	5801	0	2026-03-03T02:59:24.605Z	0
cmma0qygm0001bd33vaxt76bi	8	965af657-b8e1-4b16-b1bf-5a3046ad9869-11	unknown	1288	3865	5153	0	2026-03-03T02:59:00.982Z	0
cmma0pq4f00017bkvyrmbfvcl	6	0d03bfbf-2c16-4251-a15b-07cf6d105c4c-9	unknown	666	1996	2662	0	2026-03-03T02:58:03.519Z	0
cmmct72rj0003vazg2loqf232	57	6eaf42f1-d4e1-4494-9c28-ba8b685b5783	google/gemini-2.5-pro	1697	5092	6789	0.05304125000000001	2026-03-05T01:50:54.655Z	0
cmmct6k400001vazgf278ce01	57	6eaf42f1-d4e1-4494-9c28-ba8b685b5783	google/gemini-2.5-pro	1248	3743	4991	0.03899	2026-03-05T01:50:30.480Z	0
cmmct3j62000190o3r6jxsi30	57	1a3156db-7835-4d3e-bd3c-61c3017c669f-66	google/gemini-2.5-pro	1272	3816	5088	0.03975000000000001	2026-03-05T01:48:09.290Z	0
cmmct1toj0003aq4g4jwdce77	49	81645a67-d149-4825-9a1c-8d659fda8de0-58	google/gemini-2.5-pro	789	2367	3156	0.02465625	2026-03-05T01:46:49.603Z	0
cmmcsru4j0001aq4gbp7s4swx	49	81645a67-d149-4825-9a1c-8d659fda8de0-58	google/gemini-2.5-pro	763	2289	3052	0.02384375	2026-03-05T01:39:03.619Z	0
cmmcs9lnp0001xfxo8gv96vvr	8	313bf17e-c004-49a4-a6f8-649adcd00781-11	google/gemini-2.5-pro	1439	4318	5757	0.04497875	2026-03-05T01:24:52.837Z	0
cmnguunwg0005dw083upzihio	47	ee8fd9f1-871b-4112-8e45-5b60615a624a-56	z-ai/glm-5-turbo	6160	227	6387	0.008299999999999998	2026-04-02T02:28:01.792Z	0
cmma0bo7q0001129w4chyorkf	21	fb7a86a0-50c9-4658-9243-902d3e129cd4-26	unknown	1068	3203	4271	0	2026-03-03T02:47:07.862Z	0
cmma0b1bg0005actvj6mp01hq	21	51d554f9-1786-4761-b8bc-a9de19ed763f-26	unknown	1169	3508	4677	0	2026-03-03T02:46:38.188Z	0
cmma09yi10003actvdjcpq6i3	21	51d554f9-1786-4761-b8bc-a9de19ed763f-26	unknown	1079	3237	4316	0	2026-03-03T02:45:47.881Z	0
cmma09nr10001actvqhgpsczs	21	51d554f9-1786-4761-b8bc-a9de19ed763f-26	unknown	1068	3203	4271	0	2026-03-03T02:45:33.949Z	0
cmma0204u0003bbeme8q3zgj3	21	5e5e8986-9f55-4b90-8199-97ff62f0cb01-26	unknown	1261	3783	5044	0	2026-03-03T02:39:36.750Z	0
cmma003h30001bbemtc0jidyo	21	5e5e8986-9f55-4b90-8199-97ff62f0cb01-26	unknown	1066	3199	4265	0	2026-03-03T02:38:07.767Z	0
cmm9zzkf2000314fq373b1pmo	21	e4b54295-ff3a-4f88-930d-35c43b9ab957-26	unknown	1157	3469	4626	0	2026-03-03T02:37:43.070Z	0
cmm9zyus6000114fqb86fctwh	21	e4b54295-ff3a-4f88-930d-35c43b9ab957-26	unknown	1068	3202	4270	0	2026-03-03T02:37:09.846Z	0
cmm9zogi8000310fmt6d7opoq	21	4ccc784d-9639-4b0f-9bde-3967d137abb9-26	unknown	1222	3664	4886	0	2026-03-03T02:29:04.784Z	0
cmm9zo0k2000110fmbvpt4f53	21	4ccc784d-9639-4b0f-9bde-3967d137abb9-26	unknown	1043	3129	4172	0	2026-03-03T02:28:44.114Z	0
cmm9znkvz0001rxhn0g8abgew	21	320f2e21-6f70-425c-aa4c-322166dce639-26	unknown	1319	3958	5277	0	2026-03-03T02:28:23.807Z	0
cmm9z7gkx0003w9xfwchpz4hg	21	320f2e21-6f70-425c-aa4c-322166dce639-26	unknown	1239	3715	4954	0	2026-03-03T02:15:51.729Z	0
cmm9z6t3q0001w9xfd9h7w8bo	21	320f2e21-6f70-425c-aa4c-322166dce639-26	unknown	1043	3129	4172	0	2026-03-03T02:15:21.302Z	0
cmm9yrsdh0001ff6v6xbdgno4	3	96255ba9-1ef7-4f27-8884-fb8077bd6f2c-3	unknown	789	2367	3156	0	2026-03-03T02:03:40.517Z	0
cmpm58dm50001i0gggqrpd79l	20	f43d5a07-8da4-4b98-aa4e-b289fc8554de-25	z-ai/glm-5.1	17518	4096	21614	0	2026-05-26T04:36:53.357Z	0
cmpm31qtb000311z0o3ruu0wh	47	61c0b5c4-2681-4251-b00f-c10900cf55b6-56	z-ai/glm-5.1	9183	305	9488	0	2026-05-26T03:35:44.639Z	0
cmpl1okbn0001hwl511kz4t2d	\N	ab8a1a48-d449-4222-b6b7-008d11f9421f-11	openai/gpt-4o	1171	154	1325	0.004467500000000001	2026-05-25T10:09:43.907Z	0
cmpkx8bi60001f8lqa5p2mdjn	\N	3dfc7fa5-4ca1-4b6c-9cfd-b4bd5eb11a81-25	openai/gpt-4o	1966	167	2133	0.006585000000000001	2026-05-25T08:05:07.518Z	0
cmpkm7fdi0001n7zp257ddy40	\N	5683d607-4abe-428d-b42c-d5ced3b7fc95-11	openai/gpt-4o	1150	152	1302	0.004395	2026-05-25T02:56:30.102Z	0
cmpkltndt0001aovahwrwbm8a	24	172db7cc-4707-4050-88cd-de3aa8a5095d-31	z-ai/glm-5-turbo	6910	49	6959	0.008487999999999999	2026-05-25T02:45:47.297Z	0
cmpgkn3zh0001s65y6uoulyos	\N	383c5675-1249-4308-96f7-a4f9323135e7-25	openai/gpt-4o	2408	143	2551	0.00745	2026-05-22T07:01:37.901Z	0
cmpdoh072000111xcwucg1tdi	20	ff3c8285-e2d9-4f6c-ab9c-7c07a6e94120-25	z-ai/glm-5-turbo	17568	1271	18839	0.0261656	2026-05-20T06:25:32.990Z	0
cmp82w5g60001j4iyttso36r9	\N	5ba1229c-968d-4132-932d-126973220458-25	openai/gpt-4o	1374	166	1540	0.005095000000000001	2026-05-16T08:22:37.206Z	0
cmp3ui7pn0001vw307xq2f38h	\N	fc95a0be-de01-481d-8e41-0127f40abbb8-32	openai/gpt-4o	1765	167	1932	0.006082500000000001	2026-05-13T09:16:45.323Z	0
cmp0kre6m0003rynkhh3lb69t	29	13246981-7eba-4f3f-9248-eb24f76aeb78-36	z-ai/glm-5-turbo	7644	742	8386	0.0121408	2026-05-11T02:20:38.926Z	0
cmoe3wti00001ewcy88iw4jb5	161	f7ab8e4a-64de-4d0a-aeda-d491e8fd7cdd	z-ai/glm-5-turbo	4594	71	4665	0.0057968	2026-04-25T08:58:02.712Z	0
cmo81zbpp000f2rxaatgiccfv	43	4bd9dc88-906d-4087-8800-28be5ff8157f-50	z-ai/glm-5-turbo	9719	976	10695	0.0155668	2026-04-21T03:17:23.341Z	0
cmo7ycvg20001xsmyhezfev9s	43	bdc30824-5bd6-473a-b97e-e5d57685bfe9-50	z-ai/glm-5-turbo	7424	378	7802	0.0104208	2026-04-21T01:35:56.978Z	0
cmnyctbjd0001luegwdxltan5	57	9571937f-05b9-46fa-9e9d-db74e1f5f85b	z-ai/glm-5-turbo	4368	178	4546	0.0059536	2026-04-14T08:22:57.193Z	0
cmnpgb3hm000fll3160coe653	47	02361018-ce58-4883-9c8d-1da60ac62f60-56	z-ai/glm-5-turbo	6867	298	7165	0.0094324	2026-04-08T02:50:49.834Z	0
cmnoe47zy0009uqwfvpwoo9p4	28	3c55ff0e-d4f1-40db-bfb3-78705074aa8f-35	z-ai/glm-5-turbo	12108	274	12382	0.0156256	2026-04-07T09:01:43.678Z	0
cmnocltm90003oi2mhbsspfhe	43	fd3933de-e8cc-45e9-b167-cc6f84806e24-50	z-ai/glm-5-turbo	7595	678	8273	0.011826	2026-04-07T08:19:25.617Z	0
cmniho20e0005yjfkfqgbx5d5	47	33eb4970-d402-4165-9ca2-87300148ceb9-56	z-ai/glm-5-turbo	5415	350	5765	0.007897999999999999	2026-04-03T05:54:30.830Z	0
cmnh0v8vd0001kyeee6sks20r	47	c8c09c84-1d5e-4fae-86e3-5edd0d0e57a3-56	z-ai/glm-5-turbo	4383	558	4941	0.007491599999999999	2026-04-02T05:16:26.665Z	0
cmn31l84i0001ri3e4m2b3fxa	\N	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	openai/gpt-4o	1526	122	1648	0.005035	2026-03-23T10:27:52.290Z	0
cmn313uwj0001hkupr74p6apn	\N	f4c67e0a-9d91-45fc-9857-c5f80653ce78-66	openai/gpt-4o	1226	147	1373	0.004535000000000001	2026-03-23T10:14:22.003Z	0
cmn2ygnsx000112pjkiwisyj7	\N	f5e2f351-ffd8-4fef-857c-9130698a80eb-71	openai/gpt-4o	526	114	640	0.002455000000000001	2026-03-23T09:00:20.481Z	0
cmn2phc2200015tt11cexis67	\N	0ba34e14-1ea3-42c4-86a6-404222d046fb-19	openai/gpt-4o	1152	117	1269	0.00405	2026-03-23T04:48:55.370Z	0
cmn2nkhv00001dttt9olo5crg	48	0aaecaa2-8011-411a-b87a-ad5431d9a5b1	z-ai/glm-5-turbo	9040	949	9989	0	2026-03-23T03:55:23.628Z	0
cmma0ixik000312gkjw9qk2vx	8	5aaa17e2-8432-45c6-8c22-a8b6e4f1fb69-11	unknown	1334	4002	5336	0	2026-03-03T02:52:46.508Z	0
cmma0h91d000112gknga7skkb	8	5aaa17e2-8432-45c6-8c22-a8b6e4f1fb69-11	unknown	1293	3878	5171	0	2026-03-03T02:51:28.129Z	0
cmma0emji0001vvmjlajtfhcw	21	8348d453-b483-4f38-b6e5-b15f918c0d06-26	unknown	1073	3220	4293	0	2026-03-03T02:49:25.662Z	0
cmma0dkio0001b5311kb4twzw	8	2f9ba025-9e11-493f-b374-bfc8c342f0d7-11	unknown	1515	4543	6058	0	2026-03-03T02:48:36.384Z	0
cmma0db500005129wgdtxp04b	21	fb7a86a0-50c9-4658-9243-902d3e129cd4-26	unknown	1361	4082	5443	0	2026-03-03T02:48:24.228Z	0
cmma0ceup0003129wtk1wcf1s	21	fb7a86a0-50c9-4658-9243-902d3e129cd4-26	unknown	1263	3788	5051	0	2026-03-03T02:47:42.385Z	0
cmmyna3ce0003fwdpime3ai69	\N	64670b34-c9d2-406d-a580-a22d019bb6ee-25	openai/gpt-4o	3434	139	3573	0.009975000000000001	2026-03-20T08:36:13.550Z	0
cmmykw4w20001jucq22f9m5hh	47	8b71e0b2-cd67-4ba5-8c95-5338c5247b20-56	anthropic/claude-haiku-4.5	5716	1582	7298	0.0109008	2026-03-20T07:29:23.138Z	0
cmmyjptld00013y4s5bo5ea9b	\N	8cf4d193-3165-4302-bd59-21c6955184a9-11	openai/gpt-4o	591	111	702	0.0025875	2026-03-20T06:56:28.945Z	0
cmmxbemg00001wx5g2dtzqfnl	49	e113ee41-0062-40ea-9bef-3c431838f023-58	anthropic/claude-haiku-4.5	5154	196	5350	0.0049072	2026-03-19T10:16:03.360Z	0
cmmx75smb0001ldy15ttx7igq	\N	f465cfd5-5884-4cdd-abb1-5943a6545889-11	openai/gpt-4o	656	105	761	0.002690000000000001	2026-03-19T08:17:12.995Z	0
cmmvrkekj0001jtxinmuipk8c	102	99907b0e-59c6-4fc0-b282-0a6af0c77824	anthropic/claude-haiku-4.5	4081	33	4114	0.0033968	2026-03-18T08:12:54.595Z	0
cmmvr5bf00001u96uffxb0pih	95	934541c2-b9a2-4218-adf6-9f017a0ff0eb	anthropic/claude-haiku-4.5	4097	34	4131	0.0034136	2026-03-18T08:01:10.668Z	0
cmmvqeutp0003st07q98jwjye	53	1922af24-b1ed-4b59-a8a8-7a201636cb84	anthropic/claude-haiku-4.5	6625	452	7077	0.007108	2026-03-18T07:40:36.109Z	0
cmmtcqdid0001vw8lxo5phrs9	\N	04b1ba73-2eb8-48f2-9787-c11d42a06494-11	openai/gpt-4o	623	110	733	0.0026575	2026-03-16T15:42:06.565Z	0
cmmtcq5st0003w9hcum2f9b4d	8	04b1ba73-2eb8-48f2-9787-c11d42a06494-11	anthropic/claude-haiku-4.5	4767	48	4815	0.0040056	2026-03-16T15:41:56.573Z	0
cmmsrmu100003n9t5irtlga3v	57	2dbd2444-4080-42e0-bd23-090e1e6a5893-66	anthropic/claude-haiku-4.5	7921	995	8916	0.0103168	2026-03-16T05:51:29.412Z	0
cmmelae4k0001wnxna8on90r6	49	cb54449a-e90f-44a1-bafb-6723f7901897-58	google/gemini-2.5-pro	925	2776	3701	0.02891625	2026-03-06T07:45:04.772Z	0
cmmefocrm000110czlg4pyrxq	8	983b9a55-66e8-464e-9d6b-d152d5aaa03a-11	google/gemini-2.5-pro	707	2121	2828	0.02209375	2026-03-06T05:07:58.498Z	0
cmmec3uam0001uz4hvjnmv382	8	972a9fda-04ee-4169-8813-a47a32ced0a3-11	google/gemini-2.5-pro	858	2573	3431	0.0268025	2026-03-06T03:28:02.590Z	0
cmme8y5je000399x9bayrmhwq	8	9add8997-6545-4c71-86be-9c35f18233da-11	google/gemini-2.5-pro	1272	3816	5088	0.03975000000000001	2026-03-06T01:59:38.378Z	0
cmmd861s70001789eddhuesxf	49	ffa52481-ec18-4899-9985-bf87e557a12f-58	google/gemini-2.5-pro	831	2492	3323	0.02595875	2026-03-05T08:50:00.967Z	0
cmmd6zvxv0003luy32glvb0m5	49	898d07ca-5abb-4501-b95e-5759279aee98-58	google/gemini-2.5-pro	1438	4312	5750	0.04491750000000001	2026-03-05T08:17:13.843Z	0
cmmcya4wk000190o7lxt40eag	8	b13e19f9-8539-4678-a49e-528b7b0d59f8-11	google/gemini-2.5-pro	1805	5416	7221	0.05641625000000001	2026-03-05T04:13:15.476Z	0
cmmct9rur0005aq4gyewyva5q	49	81645a67-d149-4825-9a1c-8d659fda8de0-58	google/gemini-2.5-pro	1683	5048	6731	0.05258375000000001	2026-03-05T01:53:00.483Z	0
cmmbotr0x0005qrebufclhd05	57	a57ba900-9495-4660-8f9b-588c6604078f-66	google/gemini-2.5-pro	804	2410	3214	0.025105	2026-03-04T07:00:48.273Z	0
cmma0lfth000512gko14tjw7a	8	5aaa17e2-8432-45c6-8c22-a8b6e4f1fb69-11	unknown	1384	4150	5534	0	2026-03-03T02:54:43.541Z	0
cmpmejrbr0001k6ajestr3f4n	26	54a73da9-29c6-4522-87f0-a70e64adbc98-33	z-ai/glm-5.1	11135	640	11775	0	2026-05-26T08:57:40.887Z	0
cmpmd45t20003i2d10tshzyrt	57	dd1f1d46-821c-414e-958b-538b933266cf-66	z-ai/glm-5.1	11520	72	11592	0	2026-05-26T08:17:33.542Z	0
cmpmd3inc0001i2d1w581bsse	57	dd1f1d46-821c-414e-958b-538b933266cf-66	z-ai/glm-5.1	12175	298	12473	0	2026-05-26T08:17:03.528Z	0
cmpmcquds00011g22s388xvob	\N	bda3802e-0c2b-41b8-bb6e-4f0d5b1ffd40-36	openai/gpt-4o	1062	150	1212	0.004155000000000001	2026-05-26T08:07:12.208Z	0
cmpmcqnmi0005divvhgmaugdx	29	bda3802e-0c2b-41b8-bb6e-4f0d5b1ffd40-36	z-ai/glm-5.1	15949	410	16359	0	2026-05-26T08:07:03.450Z	0
cmpmcpvhg00014rm2wsvxt8kv	\N	bda3802e-0c2b-41b8-bb6e-4f0d5b1ffd40-36	openai/gpt-4o	1033	144	1177	0.0040225	2026-05-26T08:06:26.980Z	0
cmpmcpoww0003divvtaqaf5xz	29	bda3802e-0c2b-41b8-bb6e-4f0d5b1ffd40-36	z-ai/glm-5.1	11000	105	11105	0	2026-05-26T08:06:18.464Z	0
cmpmcicse0001divvrepawff8	29	bda3802e-0c2b-41b8-bb6e-4f0d5b1ffd40-36	z-ai/glm-5.1	10198	78	10276	0	2026-05-26T08:00:36.158Z	0
cmpmbbhfu0001o9nmlr0b4qql	\N	6d8d1680-07f4-4d22-81e6-d8f46b858149-36	openai/gpt-4o	1042	147	1189	0.004075	2026-05-26T07:27:15.978Z	0
cmn34b5sy00016g77b7v36ij4	47	78cb418b-f903-442d-a5d3-78046c7daab3-56	z-ai/glm-5-turbo	9453	1077	10530	0	2026-03-23T11:44:01.570Z	0
cmn34b3cy0001uqrvc49fe3rn	3	cb082f09-6e31-483d-bf17-06a926a3fd08-3	z-ai/glm-5-turbo	5383	580	5963	0	2026-03-23T11:43:58.402Z	0
cmn347ltx0001ph1sq055mj1f	47	bd8e18aa-b06e-4a56-aa05-9875f935dcaf-56	z-ai/glm-5-turbo	8187	1205	9392	0	2026-03-23T11:41:15.717Z	0
cmn342jct0001y3hmvb5iddd8	\N	21feeb64-b48a-41f9-bc50-31239c39d378-56	openai/gpt-4o	1356	144	1500	0.00483	2026-03-23T11:37:19.229Z	0
cmn342b7n0003v7gj3smg81va	47	21feeb64-b48a-41f9-bc50-31239c39d378-56	z-ai/glm-5-turbo	8328	4096	12424	0	2026-03-23T11:37:08.675Z	0
cmn33n9ky0001v7gj2wxineq0	47	21feeb64-b48a-41f9-bc50-31239c39d378-56	z-ai/glm-5-turbo	6489	899	7388	0	2026-03-23T11:25:26.722Z	0
cmn33djs10001morz2btpwxa9	133	85443b1b-fafb-4312-896f-b5f9648b7b36-142	z-ai/glm-5-turbo	7481	669	8150	0	2026-03-23T11:17:53.377Z	0
cmn33blxs000113l54nx59e11	47	4cd7fae5-243c-490e-b0f3-ffa7a29826e8-56	z-ai/glm-5-turbo	5168	4096	9264	0	2026-03-23T11:16:22.864Z	0
cmn336y4r0001gu72m0gj5rm8	\N	0f321f84-eb82-4b03-9330-205b28cd377e-142	openai/gpt-4o	486	114	600	0.002355	2026-03-23T11:12:45.387Z	0
cmn2mqsda0003o5kulbbgvj9t	6	a2825cd4-5e41-42f0-9d29-dd0666789f4b-9	anthropic/claude-haiku-4.5	5603	240	5843	0.0054424	2026-03-23T03:32:17.566Z	0
cmn2lbjoo00016z59y14bw6s3	20	809b944c-6e43-465b-8860-a25071d58d1e-25	z-ai/glm-5-turbo	8752	912	9664	0	2026-03-23T02:52:26.856Z	0
cmn2jqilh00014mbjuvfjhdf0	6	9ab900c9-931f-44c4-8be9-d22af8d88d13-9	anthropic/claude-haiku-4.5	5333	207	5540	0.0050944	2026-03-23T02:08:06.053Z	0
cmmyqrh660001qi9j26z0curr	8	5802980f-ebf3-4132-b02e-8cf9bf941a5d-11	anthropic/claude-haiku-4.5	5607	270	5877	0.0055656	2026-03-20T10:13:43.470Z	0
cmmyojk940001ybz2za0hyx01	49	237771fd-3353-4588-a656-daeec712d4b6-58	anthropic/claude-haiku-4.5	5152	491	5643	0.0060856	2026-03-20T09:11:34.984Z	0
cmmem00ow00017zy5daabqrr1	43	7872f33c-da21-4a64-a3ca-b67688a51535-50	google/gemini-2.5-pro	620	1860	2480	0.019375	2026-03-06T08:05:00.416Z	0
cmpmpyq4400018webp043riss	\N	ce3968f3-e727-4873-be62-2261581e630b	openai/gpt-4o	1035	130	1165	0.0038875	2026-05-26T14:17:14.932Z	0
cmmer963s0001i9b8zpi65myg	8	fc1ed0cc-bc4e-49f3-9690-6fc2636c0f48-11	google/gemini-2.5-pro	803	2408	3211	0.02508375	2026-03-06T10:32:05.416Z	0
cmmeqv5k1000110135xwoqc0b	49	fc415da4-764b-4615-80a4-ecf2f1e23142-58	google/gemini-2.5-pro	1236	3706	4942	0.038605	2026-03-06T10:21:11.521Z	0
cmmeqs98s00019a53ol6kn20x	49	662a8396-fa22-464d-8c09-0f7dc1c441a2-58	google/gemini-2.5-pro	1836	5508	7344	0.057375	2026-03-06T10:18:56.332Z	0
cmpmprsmk0001qz7s150q4jp9	\N	78c0ce5f-bb38-4ac9-b658-ce14f44e5ddb	openai/gpt-4o	1035	130	1165	0.0038875	2026-05-26T14:11:51.596Z	0
cmpm3g3su00019p9t23jgazan	29	0aff3b1a-74ce-4ab6-b9b8-5ed4522c8dd1-29	z-ai/glm-5-turbo	4655	361	5016	0.00703	2026-05-26T03:46:54.654Z	0
cmplbz8md0001b8cugqs0zsn9	\N	8b1f351f-141d-4e2c-96b5-fa2d0d007583	openai/gpt-4o	1273	152	1425	0.0047025	2026-05-25T14:57:58.117Z	0
cmpmimarb0001sa21erj6v04k	\N	3bceeccd-c907-463d-bfed-1f05d7d1f9fd-26	openai/gpt-4o	1039	131	1170	0.0039075	2026-05-26T10:51:37.847Z	0
cmpmim5pt0003gnf2l20diikn	21	3bceeccd-c907-463d-bfed-1f05d7d1f9fd-26	z-ai/glm-5.1	12519	435	12954	0	2026-05-26T10:51:31.313Z	0
cmpmilhhp0001gnf2myku7oq6	21	3bceeccd-c907-463d-bfed-1f05d7d1f9fd-26	z-ai/glm-5.1	9864	57	9921	0	2026-05-26T10:50:59.917Z	0
cmpmg37mz00019pii8j23k0ss	\N	37ab550d-2b9e-4e74-a7d3-aef1c959db34-2	openai/gpt-4o	1059	136	1195	0.004007500000000001	2026-05-26T09:40:48.107Z	0
cmn34m01v000399dfgecym0he	136	463c0104-0192-4ba5-8d98-6792b409c804	z-ai/glm-5-turbo	5624	1194	6818	0	2026-03-23T11:52:27.331Z	0
cmn34ltoo00053flw9v7npgcz	136	32c73d07-33b5-4279-8d9b-9fa896a5bae5	z-ai/glm-5-turbo	5348	1075	6423	0	2026-03-23T11:52:19.080Z	0
cmn34l1q9000199dfhohs4utf	136	463c0104-0192-4ba5-8d98-6792b409c804	z-ai/glm-5-turbo	5245	231	5476	0	2026-03-23T11:51:42.849Z	0
cmn34kk3r00033flwffndxt4x	136	32c73d07-33b5-4279-8d9b-9fa896a5bae5	z-ai/glm-5-turbo	4494	118	4612	0	2026-03-23T11:51:20.007Z	0
cmn34jweo00013flwin18njdm	136	32c73d07-33b5-4279-8d9b-9fa896a5bae5	z-ai/glm-5-turbo	4446	414	4860	0	2026-03-23T11:50:49.296Z	0
cmmeqqlb10001p7zh96sojbp4	49	b381932f-d7b2-476f-a479-20d7fc9b762b-58	google/gemini-2.5-pro	1335	4003	5338	0.04169875000000001	2026-03-06T10:17:38.653Z	0
cmmepld050001neboywbsqdcp	36	58f68d54-2e31-4486-a6aa-3a0d34494bd7-43	google/gemini-2.5-pro	0	0	0	0	2026-03-06T09:45:34.997Z	0
cmmep5cv70001fgzbb9mn8rui	8	d9cb3d44-58c2-474f-ab08-d2ebead74d5a-11	google/gemini-2.5-pro	675	2024	2699	0.02108375	2026-03-06T09:33:08.323Z	0
cmmep4pfe0001qncstaxk9v9c	8	3a624619-9cbd-493a-921a-4e0e1a32f724-11	google/gemini-2.5-pro	1541	4624	6165	0.04816625	2026-03-06T09:32:37.946Z	0
cmmeosddp0001znkgamiyei7j	49	b381932f-d7b2-476f-a479-20d7fc9b762b-58	google/gemini-2.5-pro	1294	3883	5177	0.0404475	2026-03-06T09:23:02.461Z	0
cmmem26wz00057zy5yhiwaiyz	43	7872f33c-da21-4a64-a3ca-b67688a51535-50	google/gemini-2.5-pro	999	2998	3997	0.03122875	2026-03-06T08:06:41.795Z	0
cmmem1lhf00037zy5b1441zm6	43	7872f33c-da21-4a64-a3ca-b67688a51535-50	google/gemini-2.5-pro	614	1843	2457	0.0191975	2026-03-06T08:06:14.019Z	0
cmmelye6l00016olv4bymlx4a	8	8e995d04-efe3-4ee2-b7c4-d52ac9a6775c-11	google/gemini-2.5-pro	1850	5549	7399	0.05780250000000001	2026-03-06T08:03:44.589Z	0
cmmelmfid00016ik69hhut6uk	8	c1ad2574-1c9a-4269-bb62-a7fbe345adcc-11	google/gemini-2.5-pro	1167	3499	4666	0.03644875	2026-03-06T07:54:26.437Z	0
cmmelldsg0001gr055999w199	8	ed04dab7-21cb-40aa-bed0-395050537ad7-11	google/gemini-2.5-pro	1497	4492	5989	0.04679125	2026-03-06T07:53:37.552Z	0
cmpmg2zbw0003ryuyu7n3eg6m	2	37ab550d-2b9e-4e74-a7d3-aef1c959db34-2	z-ai/glm-5.1	11618	102	11720	0	2026-05-26T09:40:37.340Z	0
cmpmg2in90001ryuyowe2vksc	2	37ab550d-2b9e-4e74-a7d3-aef1c959db34-2	z-ai/glm-5.1	11252	267	11519	0	2026-05-26T09:40:15.717Z	0
cmpmfbez70001i8s0bc4s2tjk	31	319d4615-e33a-4717-baff-7ddff84b5b02-38	z-ai/glm-5.1	11275	732	12007	0	2026-05-26T09:19:11.251Z	0
cmpmewshs00019xmj07zp61yo	24	a07fedcc-6c89-4275-bc4e-34019ed188b5-31	z-ai/glm-5.1	13575	528	14103	0	2026-05-26T09:07:48.928Z	0
cmpmd4c210001jshiv7wboocj	\N	dd1f1d46-821c-414e-958b-538b933266cf-66	openai/gpt-4o	1101	136	1237	0.0041125	2026-05-26T08:17:41.641Z	0
cmpgkmw6x0007nz5niouih5eh	20	383c5675-1249-4308-96f7-a4f9323135e7-25	z-ai/glm-5-turbo	16517	1256	17773	0.0248444	2026-05-22T07:01:27.801Z	0
cmmvqb3ay000fgosv5sl2fjir	25	d9037420-cdff-4a88-b71e-ae4834c2c96a-32	anthropic/claude-haiku-4.5	22565	567	23132	0.02032	2026-03-18T07:37:40.474Z	0
cmmtcppvj0001w9hc4a3xy401	8	04b1ba73-2eb8-48f2-9787-c11d42a06494-11	anthropic/claude-haiku-4.5	4344	54	4398	0.0036912	2026-03-16T15:41:35.935Z	0
cmmerjrce0001gi16rti5jnzh	8	779aac30-32a8-4ef4-87ba-077dfce5bea0-11	google/gemini-2.5-pro	1116	3346	4462	0.034855	2026-03-06T10:40:19.502Z	0
cmmerhfbu0001i170q02j53h6	8	76f19347-dd34-45dc-8fa3-3ed7ea05d332-11	google/gemini-2.5-pro	1047	3140	4187	0.03270875	2026-03-06T10:38:30.618Z	0
cmmerbzty0001zdubt1460afl	8	9ed12d45-04be-4174-84b3-8892c7a32b79-11	google/gemini-2.5-pro	796	2388	3184	0.024875	2026-03-06T10:34:17.254Z	0
cmn34opep00011h4v8bxttxbp	136	e8194c61-aba9-433e-bfa1-00947e001dcb	z-ai/glm-5-turbo	4887	680	5567	0	2026-03-23T11:54:33.505Z	0
cmn34ncw000011qxf1xfj36sg	\N	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	openai/gpt-4o	1076	119	1195	0.00388	2026-03-23T11:53:30.624Z	0
cmn34n5ho00016miue4j6gkcp	131	8432f4e8-d05f-45c5-b867-4cc9ec4ccc6a	z-ai/glm-5-turbo	21106	1387	22493	0	2026-03-23T11:53:21.036Z	0
cmpgxyeem000b2xjhdiv6co9n	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	19448	711	20159	0.0261816	2026-05-22T13:14:19.630Z	0
cmpgxwqvf0001fw5y1no89i9s	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1397	170	1567	0.005192500000000001	2026-05-22T13:13:02.475Z	0
cmpgxwikl00092xjhoq0s91cl	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	15438	1076	16514	0.0228296	2026-05-22T13:12:51.717Z	0
cmpgxv4ob0001ucx9y0g4gezb	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1611	157	1768	0.005597500000000001	2026-05-22T13:11:47.051Z	0
cmpgxuwqv00072xjhj5dohmhk	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	11816	502	12318	0.0161872	2026-05-22T13:11:36.775Z	0
cmpgxs1qw00052xjh6g5tnkog	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	7977	642	8619	0.0121404	2026-05-22T13:09:23.288Z	0
cmpgxrcmi00018o8kh8gm048s	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1022	126	1148	0.003815000000000001	2026-05-22T13:08:50.730Z	0
cmpgxr2x200032xjhce0ohs8f	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	4673	55	4728	0.0058276	2026-05-22T13:08:38.150Z	0
cmpexgyuz00018ospxrwq05og	29	f9c53f55-2bbb-4588-993f-bd51fc7ad1eb-29	z-ai/glm-5-turbo	4652	163	4815	0.006234399999999999	2026-05-21T03:25:13.979Z	0
cmpexcwhp0001wp8ai24qvfev	29	1d5ee996-0295-4da0-af49-8001932e22b5-29	z-ai/glm-5-turbo	4650	135	4785	0.00612	2026-05-21T03:22:04.285Z	0
cmpdzu8og0001ue1pmdacir2a	\N	f8988803-af3c-484f-98d6-86f13d91f76b	openai/gpt-4o	1128	132	1260	0.00414	2026-05-20T11:43:46.288Z	0
cmpdzu1010007y1plt32648l7	102	f8988803-af3c-484f-98d6-86f13d91f76b	z-ai/glm-5-turbo	4895	547	5442	0.008062	2026-05-20T11:43:36.337Z	0
cmpdzt9340001cpiph2c2n211	\N	f8988803-af3c-484f-98d6-86f13d91f76b	openai/gpt-4o	1050	123	1173	0.003855	2026-05-20T11:43:00.160Z	0
cmpdzt1v80005y1plnzi02syb	102	f8988803-af3c-484f-98d6-86f13d91f76b	z-ai/glm-5-turbo	4831	161	4992	0.006441199999999999	2026-05-20T11:42:50.804Z	0
cmpdzsf4g0001hvrv1o041yjd	\N	f8988803-af3c-484f-98d6-86f13d91f76b	openai/gpt-4o	1057	143	1200	0.004072500000000001	2026-05-20T11:42:21.328Z	0
cmpdzs5ed0003y1pldz273d7x	102	f8988803-af3c-484f-98d6-86f13d91f76b	z-ai/glm-5-turbo	4708	67	4775	0.005917599999999999	2026-05-20T11:42:08.725Z	0
cmpdzrkyi0001y1pl3ss3wqz1	102	f8988803-af3c-484f-98d6-86f13d91f76b	z-ai/glm-5-turbo	4649	71	4720	0.0058628	2026-05-20T11:41:42.234Z	0
cmpcglqgt0002ft5vb723pzrp	122	2ddfc1c7-e84d-4d74-9c02-e873ab746184	z-ai/glm-5-turbo	4643	161	4804	0.006215599999999999	2026-05-19T09:57:30.557Z	0
cmpcgko1e00016bxdx59aj4iw	121	63f127cf-aa44-4d3c-b5da-f74e2674f174-118	z-ai/glm-5-turbo	4656	226	4882	0.0064912	2026-05-19T09:56:40.754Z	0
cmpce23fq000216ir9kwmk6et	120	da45812d-8fc8-4c98-b73e-6e3e59c39d44	z-ai/glm-5-turbo	4648	1354	6002	0.0109936	2026-05-19T08:46:15.014Z	0
cmplbx89p000213ykth8kksib	124	8b1f351f-141d-4e2c-96b5-fa2d0d007583	z-ai/glm-5-turbo	4788	473	5261	0.0076376	2026-05-25T14:56:24.349Z	0
cmpgyqarg0003dc23lhlbz1je	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1037	166	1203	0.0042525	2026-05-22T13:36:01.276Z	0
cmpgyq4bu000pwfpaw4de7qii	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	33435	34	33469	0.040258	2026-05-22T13:35:52.938Z	0
cmpgypxq60001dc23htdj9buj	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1036	143	1179	0.00402	2026-05-22T13:35:44.382Z	0
cmpgypply000nwfpas62p5i1o	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	33401	114	33515	0.0405372	2026-05-22T13:35:33.862Z	0
cmpgypdmh000187rh3fnp0q9r	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1032	160	1192	0.004180000000000001	2026-05-22T13:35:18.329Z	0
cmpgyp1ti000lwfpaq8abjka9	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	33364	74	33438	0.0403328	2026-05-22T13:35:03.030Z	0
cmpgyoqoy0003gc8wsag9ewbk	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1047	164	1211	0.0042575	2026-05-22T13:34:48.610Z	0
cmpgyok24000jwfpaph4glf5g	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	33332	205	33537	0.0408184	2026-05-22T13:34:40.012Z	0
cmpgyoh1t0001gc8wym13mi7d	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1075	157	1232	0.004257500000000001	2026-05-22T13:34:36.113Z	0
cmpgyo8df000hwfpapiwow1b8	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	33286	357	33643	0.0413712	2026-05-22T13:34:24.867Z	0
cmpgyntb90005fz3eod9sili4	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1040	157	1197	0.00417	2026-05-22T13:34:05.349Z	0
cmpgynm7y000fwfpa93py2q6i	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	33211	323	33534	0.0411452	2026-05-22T13:33:56.158Z	0
cmpgynf9c0003fz3er2wpzmyb	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1045	136	1181	0.0039725	2026-05-22T13:33:47.136Z	0
cmpgyn8ik000dwfpacpfs5c6x	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	33171	88	33259	0.0401572	2026-05-22T13:33:38.396Z	0
cmpgyn8gu0001fz3e6pgnirsd	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	2387	151	2538	0.007477500000000001	2026-05-22T13:33:38.334Z	0
cmpgymylr000bwfpa0owvfwvp	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	33128	376	33504	0.0412576	2026-05-22T13:33:25.551Z	0
cmpgymlns00015jmaf3xdsefx	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1200	159	1359	0.00459	2026-05-22T13:33:08.776Z	0
cmpgymdfh0009wfpav32iuce0	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	31815	1395	33210	0.043758	2026-05-22T13:32:58.109Z	0
cmpgylabc0001w7w1k6w7n4j2	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1505	153	1658	0.0052925	2026-05-22T13:32:07.416Z	0
cmpgyl2mw0007wfpaf935t74u	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	24303	217	24520	0.0300316	2026-05-22T13:31:57.464Z	0
cmpgyfu240002wfpas1wfe1t8	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	23177	534	23711	0.0299484	2026-05-22T13:27:53.068Z	0
cmpgxz5qs0001afla3n5rxbma	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	1629	154	1783	0.005612500000000001	2026-05-22T13:14:55.060Z	0
cmpgxyxnc000d2xjho7rrxdvv	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	19813	685	20498	0.0265156	2026-05-22T13:14:44.568Z	0
cmpgxymqv0001zq8z5djgp02u	\N	24041aa0-64ae-443f-baab-ce37eacf110f	openai/gpt-4o	2042	174	2216	0.006845	2026-05-22T13:14:30.439Z	0
cmp4tksod000123k3wej2jr3r	23	30f6018b-83be-4ced-b478-c180652a8e8a-23	z-ai/glm-5-turbo	5328	308	5636	0.0076256	2026-05-14T01:38:32.365Z	0
cmp3wucze0001p7ylhe2moeny	99	d475f9f4-75e0-47a6-ab37-ef645a6b29af-97	z-ai/glm-5-turbo	4650	58	4708	0.005811999999999999	2026-05-13T10:22:11.258Z	0
cmp3vhujr00028tqoc8fuita8	116	a1ec4743-6f42-4275-8d74-e5f2911b0907	z-ai/glm-5-turbo	4648	181	4829	0.006301599999999999	2026-05-13T09:44:27.879Z	0
cmp3ut3ly0002xgrl1s7dus0h	115	2369b906-3e5a-484b-a0cb-4752eb7d3577	z-ai/glm-5-turbo	4644	78	4722	0.0058848	2026-05-13T09:25:13.222Z	0
cmp2bom6s00017cw04xt9t0eu	45	d1507bd3-9aa8-4319-9ac2-49a3919b72f8-45	z-ai/glm-5-turbo	7601	2652	10253	0.0197292	2026-05-12T07:42:05.140Z	0
cmp255kp70001xrlmqd6x1ud4	\N	f2719ee5-69a3-4e23-a776-dbd0080d17cd-45	openai/gpt-4o	4866	147	5013	0.013635	2026-05-12T04:39:19.051Z	0
cmp255bs000015e2ruyoknrmu	45	f2719ee5-69a3-4e23-a776-dbd0080d17cd-45	z-ai/glm-5-turbo	31715	990	32705	0.042018	2026-05-12T04:39:07.488Z	0
cmp23l9hv0001v5vmp3bl91e6	3	62df1b38-203f-4f3e-b929-ef5afa3c657f-3	z-ai/glm-5-turbo	7652	858	8510	0.0126144	2026-05-12T03:55:31.795Z	0
cmp1zgf7w000125e3nznrxchr	\N	f54711b5-0337-4d59-abab-496bd79427b6	openai/gpt-4o	625	139	764	0.0029525	2026-05-12T01:59:47.468Z	0
cmp1zg7hk0003mi10fwmwq032	9	f54711b5-0337-4d59-abab-496bd79427b6	z-ai/glm-5-turbo	6220	1067	7287	0.011732	2026-05-12T01:59:37.448Z	0
cmp1zf4h40001mi101j8ebshr	9	f54711b5-0337-4d59-abab-496bd79427b6	z-ai/glm-5-turbo	5325	569	5894	0.008666	2026-05-12T01:58:46.888Z	0
cmp1i6bcs0001ets2aks2mvew	29	c707cd3c-7576-4a17-b040-3ae6bf303fa1-29	z-ai/glm-5-turbo	6047	460	6507	0.0090964	2026-05-11T17:56:02.428Z	0
cmp0x1c0500014f18lfhbq0jo	\N	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	openai/gpt-4o	1292	124	1416	0.00447	2026-05-11T08:04:18.053Z	0
cmp0x14nf000djy72amnkd7et	29	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	z-ai/glm-5-turbo	11183	361	11544	0.0148636	2026-05-11T08:04:08.523Z	0
cmp0wk1qr0001car66w77b6m7	\N	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	openai/gpt-4o	1296	113	1409	0.004370000000000001	2026-05-11T07:50:51.603Z	0
cmp0wjtu5000bjy72u5fmhnug	29	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	z-ai/glm-5-turbo	10384	880	11264	0.0159808	2026-05-11T07:50:41.357Z	0
cmp0why8g0001qvctumxa4fh6	\N	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	openai/gpt-4o	1388	159	1547	0.00506	2026-05-11T07:49:13.744Z	0
cmp0whqjp0009jy72p7hi36au	29	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	z-ai/glm-5-turbo	9919	447	10366	0.0136908	2026-05-11T07:49:03.781Z	0
cmp0vnw4v00017g2xwwl03y8h	\N	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	openai/gpt-4o	1088	127	1215	0.00399	2026-05-11T07:25:51.343Z	0
cmp0vnph80007jy7264tc9zrw	29	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	z-ai/glm-5-turbo	8993	588	9581	0.0131436	2026-05-11T07:25:42.716Z	0
cmpc76too0003qwvczagfeppx	58	46cdcaec-0dd3-45d6-8c73-433799491e94-57	z-ai/glm-5-turbo	15031	2537	17568	0.0281852	2026-05-19T05:33:58.344Z	0
cmpc75g550001qwvcgbcpqe3v	58	46cdcaec-0dd3-45d6-8c73-433799491e94-57	z-ai/glm-5-turbo	6313	535	6848	0.0097156	2026-05-19T05:32:54.137Z	0
cmpc6yjtv0001y7oa3la5mtc4	\N	e7b5e3e6-686d-4ba7-b652-db550e57d264-57	openai/gpt-4o	1136	119	1255	0.004030000000000001	2026-05-19T05:27:32.323Z	0
cmpc6ybff0003xb6pz6fyye1l	58	e7b5e3e6-686d-4ba7-b652-db550e57d264-57	z-ai/glm-5-turbo	25743	1600	27343	0.03729159999999999	2026-05-19T05:27:21.435Z	0
cmpc6t6dw0001xb6pklbmnmb9	58	e7b5e3e6-686d-4ba7-b652-db550e57d264-57	z-ai/glm-5-turbo	7604	467	8071	0.0109928	2026-05-19T05:23:21.620Z	0
cmpc6rzrd0002nq6qtkjwq3oj	119	ec1a436e-99a7-45e3-b71e-eff59a8f0ef4	z-ai/glm-5-turbo	4649	58	4707	0.0058108	2026-05-19T05:22:26.377Z	0
cmpc3bpy90003foi1tselhxnr	29	056d1862-b7b5-4165-9680-44f910308aaf-29	z-ai/glm-5-turbo	8472	160	8632	0.0108064	2026-05-19T03:45:48.321Z	0
cmpc2bx0l0001adb9y3dtwi45	\N	6def1b03-f929-46c5-9b01-e1c42617ed83	openai/gpt-4o	1746	141	1887	0.005775	2026-05-19T03:17:57.861Z	0
cmpc2boqc00084yldcoh8yy9q	118	6def1b03-f929-46c5-9b01-e1c42617ed83	z-ai/glm-5-turbo	11194	569	11763	0.0157088	2026-05-19T03:17:47.124Z	0
cmpc22j0f00019dcfsb1t302u	\N	6def1b03-f929-46c5-9b01-e1c42617ed83	openai/gpt-4o	1511	162	1673	0.0053975	2026-05-19T03:10:39.807Z	0
cmpc22afm00064ylda6lo7qrf	118	6def1b03-f929-46c5-9b01-e1c42617ed83	z-ai/glm-5-turbo	10618	807	11425	0.0159696	2026-05-19T03:10:28.690Z	0
cmpc1ak1u0001foi1l2cvypah	29	056d1862-b7b5-4165-9680-44f910308aaf-29	z-ai/glm-5-turbo	7564	662	8226	0.0117248	2026-05-19T02:48:54.786Z	0
cmpc1a28v0001l86x9jlnnej2	29	c3df047e-c528-4bd4-b1f5-3bd280d4d8e3-29	z-ai/glm-5-turbo	4641	178	4819	0.0062812	2026-05-19T02:48:31.711Z	0
cmpc1678200044yldopsmhs7n	118	6def1b03-f929-46c5-9b01-e1c42617ed83	z-ai/glm-5-turbo	7485	515	8000	0.011042	2026-05-19T02:45:31.538Z	0
cmpc1295500024yld1z82iye2	118	6def1b03-f929-46c5-9b01-e1c42617ed83	z-ai/glm-5-turbo	4648	62	4710	0.005825599999999999	2026-05-19T02:42:27.401Z	0
cmp8dyva7000114419y80t0d9	29	1e30795e-f8b0-4dba-87e0-738972d4748a-29	z-ai/glm-5-turbo	7269	325	7594	0.0100228	2026-05-16T13:32:39.775Z	0
cmp87u96i000111g2mh9iawrp	58	4b4cd73a-1c8e-47d6-aee8-cfea89085e30-57	z-ai/glm-5-turbo	4648	150	4798	0.006177599999999999	2026-05-16T10:41:06.810Z	0
cmp824fzm0001vd9bis4exbs4	\N	69096fd8-a71c-49d6-883f-138c71c41ea6-29	openai/gpt-4o	1784	171	1955	0.00617	2026-05-16T08:01:04.498Z	0
cmp82478n000310cxiz41nhet	29	69096fd8-a71c-49d6-883f-138c71c41ea6-29	z-ai/glm-5-turbo	13102	985	14087	0.0196624	2026-05-16T08:00:53.159Z	0
cmp81uxxd000110cx7l3xsvbm	29	69096fd8-a71c-49d6-883f-138c71c41ea6-29	z-ai/glm-5-turbo	7365	788	8153	0.01199	2026-05-16T07:53:41.185Z	0
cmp6o9vlh0001j3t84g506k0r	\N	4be8c43d-c18b-4ee4-b0b6-1f3473f6fbb3-17	openai/gpt-4o	4288	180	4468	0.01252	2026-05-15T08:45:37.205Z	0
cmp6o4e9o000113itnr9yo2ko	\N	4be8c43d-c18b-4ee4-b0b6-1f3473f6fbb3-17	openai/gpt-4o	1107	170	1277	0.004467500000000001	2026-05-15T08:41:21.468Z	0
cmp6o46d20003pkqfd14d5zqy	17	4be8c43d-c18b-4ee4-b0b6-1f3473f6fbb3-17	z-ai/glm-5-turbo	40242	4487	44729	0.0662384	2026-05-15T08:41:11.222Z	0
cmp6nvb1000011491op4q5o2v	\N	4be8c43d-c18b-4ee4-b0b6-1f3473f6fbb3-17	openai/gpt-4o	7052	178	7230	0.01941	2026-05-15T08:34:17.364Z	0
cmp6nv1ur0001pkqf3qiy1qo9	17	4be8c43d-c18b-4ee4-b0b6-1f3473f6fbb3-17	z-ai/glm-5-turbo	35099	935	36034	0.0458588	2026-05-15T08:34:05.475Z	0
cmouuqwu20001xfh3y14m15rz	58	759aa993-f5e0-4cc6-81c4-3e3c01ca7179-57	z-ai/glm-5-turbo	5187	85	5272	0.0065644	2026-05-07T02:13:35.546Z	0
cmouu30s40001xmorifx0ncw4	\N	a7ea86be-73ce-4c4b-beed-42b54b9b2546-57	openai/gpt-4o	1304	130	1434	0.004560000000000001	2026-05-07T01:55:00.916Z	0
cmouu2sr90005w6tqgxfpgcbx	58	a7ea86be-73ce-4c4b-beed-42b54b9b2546-57	z-ai/glm-5-turbo	6059	2881	8940	0.0187948	2026-05-07T01:54:50.517Z	0
cmouu1ag70001ji5u3fomdvbt	23	bd85a56f-e07a-4a38-86f1-b0b26a2b3c6f-23	z-ai/glm-5-turbo	5908	737	6645	0.0100376	2026-05-07T01:53:40.135Z	0
cmouu0wxr000113rbkv41hw93	\N	a7ea86be-73ce-4c4b-beed-42b54b9b2546-57	openai/gpt-4o	963	124	1087	0.003647500000000001	2026-05-07T01:53:22.623Z	0
cmouu0pqk0003w6tqluvwow47	58	a7ea86be-73ce-4c4b-beed-42b54b9b2546-57	z-ai/glm-5-turbo	5611	171	5782	0.0074172	2026-05-07T01:53:13.292Z	0
cmoutyphm0001w6tqdnqeuh11	58	a7ea86be-73ce-4c4b-beed-42b54b9b2546-57	z-ai/glm-5-turbo	5143	95	5238	0.006551599999999999	2026-05-07T01:51:39.658Z	0
cmouty9fz0003xxjhct4joiie	58	0f2810c2-ae58-45f2-8908-967a554e7d9b-57	z-ai/glm-5-turbo	8248	762	9010	0.0129456	2026-05-07T01:51:18.863Z	0
cmoutwqxi0001xxjhv3jcc8ha	58	0f2810c2-ae58-45f2-8908-967a554e7d9b-57	z-ai/glm-5-turbo	7279	629	7908	0.0112508	2026-05-07T01:50:08.214Z	0
cmoutwdxz0001mo642fum627j	\N	4e0be9a5-7002-4206-9bda-947b772ab96c-57	openai/gpt-4o	608	130	738	0.00282	2026-05-07T01:49:51.383Z	0
cmoutw5u00003dpjd6vjr2m6w	58	4e0be9a5-7002-4206-9bda-947b772ab96c-57	z-ai/glm-5-turbo	17189	2238	19427	0.0295788	2026-05-07T01:49:40.872Z	0
cmouttmf20001dpjdj3kkvazh	58	4e0be9a5-7002-4206-9bda-947b772ab96c-57	z-ai/glm-5-turbo	5996	513	6509	0.0092472	2026-05-07T01:47:42.398Z	0
cmoutsvh20001nt48qe520l16	\N	da30feb7-1055-4b73-8c3d-6eaceccf14d8-57	openai/gpt-4o	1275	125	1400	0.0044375	2026-05-07T01:47:07.478Z	0
cmoutsn630007kbt8tbu4mqio	58	da30feb7-1055-4b73-8c3d-6eaceccf14d8-57	z-ai/glm-5-turbo	6313	3070	9383	0.0198556	2026-05-07T01:46:56.715Z	0
cmoutq0tv0005kbt8rpom4duj	58	da30feb7-1055-4b73-8c3d-6eaceccf14d8-57	z-ai/glm-5-turbo	5529	75	5604	0.0069348	2026-05-07T01:44:54.451Z	0
cmoutpuh400014cay0jbjjraf	\N	da30feb7-1055-4b73-8c3d-6eaceccf14d8-57	openai/gpt-4o	543	118	661	0.0025375	2026-05-07T01:44:46.216Z	0
cmoutpmzu0003kbt8r5bgp5mt	58	da30feb7-1055-4b73-8c3d-6eaceccf14d8-57	z-ai/glm-5-turbo	5214	454	5668	0.0080728	2026-05-07T01:44:36.522Z	0
cmoutmrro0001kbt8sbenpfvb	58	da30feb7-1055-4b73-8c3d-6eaceccf14d8-57	z-ai/glm-5-turbo	5238	108	5346	0.0067176	2026-05-07T01:42:22.740Z	0
cmousg2iy0003253asy0d3efp	\N	b7e3a11c-de8e-40cb-b84e-bf93fefba984-57	openai/gpt-4o	1401	129	1530	0.004792500000000001	2026-05-07T01:09:10.474Z	0
cmousfvqg0007oqd2lkkg1n16	58	b7e3a11c-de8e-40cb-b84e-bf93fefba984-57	z-ai/glm-5-turbo	25179	1304	26483	0.0354308	2026-05-07T01:09:01.672Z	0
cmp0vm5ro0005jy7210vsb4mp	29	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	z-ai/glm-5-turbo	8372	654	9026	0.0126624	2026-05-11T07:24:30.516Z	0
cmp0vl52d0001jpy2uf27y0vr	\N	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	openai/gpt-4o	1348	127	1475	0.00464	2026-05-11T07:23:42.949Z	0
cmp0vkszc0003jy72coqgu2rg	29	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	z-ai/glm-5-turbo	7882	749	8631	0.0124544	2026-05-11T07:23:27.288Z	0
cmp0vj76f0001jy7295mynnbf	29	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	z-ai/glm-5-turbo	4934	367	5301	0.007388799999999999	2026-05-11T07:22:12.375Z	0
cmoygud5p0001w8evyy66lywf	109	18275b5a-8a63-4521-b47e-1fba343e3c25	z-ai/glm-5-turbo	4382	173	4555	0.0059504	2026-05-09T14:55:26.749Z	0
cmowktmji0001jmdzz5wabrhk	106	ccd94916-0d88-416c-9931-ef4d3f6f1df7	z-ai/glm-5-turbo	4461	240	4701	0.0063132	2026-05-08T07:11:18.366Z	0
cmova1ent0001msh2iww96tec	23	9255f3e9-af5d-44eb-8000-4e0e38bb63e4-23	z-ai/glm-5-turbo	4915	421	5336	0.007581999999999999	2026-05-07T09:21:39.449Z	0
cmouz8y2t0001zvd42sw1pw83	58	b2725df2-5829-413e-b696-290b949d6ec2-57	z-ai/glm-5-turbo	7322	543	7865	0.0109584	2026-05-07T04:19:35.429Z	0
cmouxr27t00013ysus0o8i9xb	58	33c057cb-65df-4fbe-8ded-7855716f26c2-57	z-ai/glm-5-turbo	4871	388	5259	0.0073972	2026-05-07T03:37:41.369Z	0
cmouw4tdq0001w7uicrr9fpv3	\N	a69ec887-0195-40ee-b80e-68af42ace7b7-57	openai/gpt-4o	702	120	822	0.002955	2026-05-07T02:52:23.870Z	0
cmouw4m6d0005m6heayys0752	58	a69ec887-0195-40ee-b80e-68af42ace7b7-57	z-ai/glm-5-turbo	13670	2554	16224	0.02662	2026-05-07T02:52:14.533Z	0
cmouw2d4z00012ak69plpn1kp	\N	a69ec887-0195-40ee-b80e-68af42ace7b7-57	openai/gpt-4o	592	127	719	0.00275	2026-05-07T02:50:29.507Z	0
cmouw26em0003m6heusnc94vj	58	a69ec887-0195-40ee-b80e-68af42ace7b7-57	z-ai/glm-5-turbo	6808	474	7282	0.0100656	2026-05-07T02:50:20.782Z	0
cmouw1psv0001m6he2isgmxdp	58	a69ec887-0195-40ee-b80e-68af42ace7b7-57	z-ai/glm-5-turbo	6042	526	6568	0.009354399999999999	2026-05-07T02:49:59.263Z	0
cmouvmfq80001122526kfru0u	\N	af0df2cd-6d21-45e5-a24e-c1b3c97363d5-3	openai/gpt-4o	603	134	737	0.0028475	2026-05-07T02:38:06.368Z	0
cmouvm6ro0003pob6q80371tz	3	af0df2cd-6d21-45e5-a24e-c1b3c97363d5-3	z-ai/glm-5-turbo	12205	2580	14785	0.024966	2026-05-07T02:37:54.756Z	0
cmouvk27s0001pob6zuotr7kv	3	af0df2cd-6d21-45e5-a24e-c1b3c97363d5-3	z-ai/glm-5-turbo	6046	547	6593	0.009443199999999999	2026-05-07T02:36:15.544Z	0
cmouvbm7t0001qnapieb82g0q	\N	b3e0e89a-5dcf-4937-a4cb-227063e8fac7-57	openai/gpt-4o	1278	123	1401	0.004425	2026-05-07T02:29:41.561Z	0
cmouvbf9g0003fb0y7bt9mxo9	58	b3e0e89a-5dcf-4937-a4cb-227063e8fac7-57	z-ai/glm-5-turbo	5980	3266	9246	0.02024	2026-05-07T02:29:32.548Z	0
cmouv92yd0001fb0yhq0lfi73	58	b3e0e89a-5dcf-4937-a4cb-227063e8fac7-57	z-ai/glm-5-turbo	5187	78	5265	0.0065364	2026-05-07T02:27:43.285Z	0
cmouuyldd00017uhfeuzkcydr	\N	759aa993-f5e0-4cc6-81c4-3e3c01ca7179-57	openai/gpt-4o	1135	129	1264	0.0041275	2026-05-07T02:19:33.937Z	0
cmouuu1r10001axseu1k52mwm	\N	759aa993-f5e0-4cc6-81c4-3e3c01ca7179-57	openai/gpt-4o	1151	137	1288	0.0042475	2026-05-07T02:16:01.885Z	0
cmouuttai0005xfh3yeg193ds	58	759aa993-f5e0-4cc6-81c4-3e3c01ca7179-57	z-ai/glm-5-turbo	5945	233	6178	0.008066	2026-05-07T02:15:50.922Z	0
cmouutfis0001tv4h1h36h0vl	\N	759aa993-f5e0-4cc6-81c4-3e3c01ca7179-57	openai/gpt-4o	954	137	1091	0.003755000000000001	2026-05-07T02:15:33.076Z	0
cmouut74q0003xfh3snagtpct	58	759aa993-f5e0-4cc6-81c4-3e3c01ca7179-57	z-ai/glm-5-turbo	5651	228	5879	0.007693199999999999	2026-05-07T02:15:22.202Z	0
cmotle2gt000113ektnd2jxru	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	16699	325	17024	0.0213388	2026-05-06T05:03:53.597Z	0
cmotiz0q3000111dvcle2j32u	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	1996	117	2113	0.006160000000000001	2026-05-06T03:56:12.267Z	0
cmotiysys000p10h1ws50g97m	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	15933	498	16431	0.0211116	2026-05-06T03:56:02.212Z	0
cmotiwj9e0001b3m3o5xbley9	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	1847	104	1951	0.0056575	2026-05-06T03:54:16.322Z	0
cmotiwbsp000n10h15r5ewtfd	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	14901	532	15433	0.0200092	2026-05-06T03:54:06.649Z	0
cmotiurcs0001xryug8jieosd	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	1632	103	1735	0.00511	2026-05-06T03:52:53.500Z	0
cmotiukjh000l10h1z71dzc80	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	13945	437	14382	0.018482	2026-05-06T03:52:44.669Z	0
cmotip22000017sl6wnj4g3ys	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	1722	129	1851	0.005595000000000001	2026-05-06T03:48:27.432Z	0
cmotiou0c000j10h15j268uv4	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	13149	374	13523	0.0172748	2026-05-06T03:48:17.004Z	0
cmotifl7v0001r4uco77twv3z	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	2372	102	2474	0.00695	2026-05-06T03:41:05.707Z	0
cmotifdnf000f10h1432t24mu	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	11423	465	11888	0.0155676	2026-05-06T03:40:55.899Z	0
cmoticqwc0001w77moholebct	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	2556	119	2675	0.007580000000000001	2026-05-06T03:38:53.100Z	0
cmoticiue000d10h1roew1q4a	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	10395	601	10996	0.014878	2026-05-06T03:38:42.662Z	0
cmoti2ue400017o2sy5zrrwfr	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	2227	129	2356	0.006857500000000001	2026-05-06T03:31:11.068Z	0
cmoti2lfy000b10h1ov6sxhxp	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	9050	491	9541	0.012824	2026-05-06T03:30:59.470Z	0
cmothxl0h0001bqs1c6epx9ic	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	2035	97	2132	0.0060575	2026-05-06T03:27:05.633Z	0
cmothxdyw000910h1eydchghi	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	7764	591	8355	0.0116808	2026-05-06T03:26:56.504Z	0
cmothwfik000114kksvxu74bt	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	1525	140	1665	0.0052125	2026-05-06T03:26:11.852Z	0
cmous9b0g0005oqd2gbcq848s	58	b7e3a11c-de8e-40cb-b84e-bf93fefba984-57	z-ai/glm-5-turbo	21504	938	22442	0.0295568	2026-05-07T01:03:54.880Z	0
cmourcyyz000147drkv9i5teq	\N	b7e3a11c-de8e-40cb-b84e-bf93fefba984-57	openai/gpt-4o	609	140	749	0.002922500000000001	2026-05-07T00:38:46.283Z	0
cmourcrnk0003oqd25tnj01dz	58	b7e3a11c-de8e-40cb-b84e-bf93fefba984-57	z-ai/glm-5-turbo	16715	3131	19846	0.032582	2026-05-07T00:38:36.800Z	0
cmour9bl70001oqd2c83oebdx	58	b7e3a11c-de8e-40cb-b84e-bf93fefba984-57	z-ai/glm-5-turbo	6045	534	6579	0.009389999999999999	2026-05-07T00:35:56.011Z	0
cmouqr1t0000114fdos83h8nu	58	74d71e6a-3b96-4545-87b3-236176a34047-57	z-ai/glm-5-turbo	6045	527	6572	0.009362	2026-05-07T00:21:43.524Z	0
cmotvljtt0001rwzlcysbkh9c	\N	09e64a5d-701a-425b-8aac-ea1a117364fd-29	openai/gpt-4o	733	134	867	0.0031725	2026-05-06T09:49:38.849Z	0
cmotvlcgj0001nla97l5qr485	29	09e64a5d-701a-425b-8aac-ea1a117364fd-29	z-ai/glm-5-turbo	15885	4791	20676	0.038226	2026-05-06T09:49:29.299Z	0
cmotrizsm0001uahj7i8hh5fm	\N	f2719ee5-69a3-4e23-a776-dbd0080d17cd-45	openai/gpt-4o	745	128	873	0.0031425	2026-05-06T07:55:41.110Z	0
cmotrisgq0009opubuwib08ce	45	f2719ee5-69a3-4e23-a776-dbd0080d17cd-45	z-ai/glm-5-turbo	29939	3966	33905	0.0517908	2026-05-06T07:55:31.610Z	0
cmotrbvfh0001qyiei2am3eml	\N	f2719ee5-69a3-4e23-a776-dbd0080d17cd-45	openai/gpt-4o	4165	121	4286	0.0116225	2026-05-06T07:50:08.861Z	0
cmotrbo840007opubys2285b5	45	f2719ee5-69a3-4e23-a776-dbd0080d17cd-45	z-ai/glm-5-turbo	25274	827	26101	0.0336368	2026-05-06T07:49:59.524Z	0
cmotr9wjk0001e2grtolpxd6a	\N	f2719ee5-69a3-4e23-a776-dbd0080d17cd-45	openai/gpt-4o	3069	163	3232	0.0093025	2026-05-06T07:48:36.992Z	0
cmotr9ovx0005opubrx1r69af	45	f2719ee5-69a3-4e23-a776-dbd0080d17cd-45	z-ai/glm-5-turbo	21590	3808	25398	0.04114	2026-05-06T07:48:27.069Z	0
cmotr6cpw0001cr9zb2pvy5m7	\N	f2719ee5-69a3-4e23-a776-dbd0080d17cd-45	openai/gpt-4o	748	156	904	0.00343	2026-05-06T07:45:51.332Z	0
cmotr64bq0003opubecsfsp34	45	f2719ee5-69a3-4e23-a776-dbd0080d17cd-45	z-ai/glm-5-turbo	21600	3289	24889	0.039076	2026-05-06T07:45:40.454Z	0
cmotqvr750001opubhs6n4x8l	45	f2719ee5-69a3-4e23-a776-dbd0080d17cd-45	z-ai/glm-5-turbo	12788	1130	13918	0.0198656	2026-05-06T07:37:36.881Z	0
cmotqoi3g0001ro92wi8k50px	45	85797bcc-a685-422a-a270-34e709ab751f-45	z-ai/glm-5-turbo	13719	847	14566	0.0198508	2026-05-06T07:31:58.492Z	0
cmotlrffj0001z7kovft19sg8	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	974	111	1085	0.003545	2026-05-06T05:14:16.927Z	0
cmotlr77b000913ekb1r5wb05	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	18648	239	18887	0.0233336	2026-05-06T05:14:06.263Z	0
cmotlqr9n00011bxodahnm4gy	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	1217	139	1356	0.004432500000000001	2026-05-06T05:13:45.611Z	0
cmotlqj53000713ekow7i0dyt	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	18275	152	18427	0.022538	2026-05-06T05:13:35.079Z	0
cmotlppfl000513ekk5t3no4v	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	17825	316	18141	0.022654	2026-05-06T05:12:56.577Z	0
cmotlgfky0001761o25xg2u95	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	1338	103	1441	0.004375	2026-05-06T05:05:43.906Z	0
cmotlg89h000313ekahcujcpj	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	17261	265	17526	0.0217732	2026-05-06T05:05:34.421Z	0
cmotleah40001ua0kb7l2mham	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	1703	111	1814	0.0053675	2026-05-06T05:04:03.976Z	0
cmob0yin90001wfudvrewmru9	3	31e669c9-8229-497f-bd48-f457ee4c1ffb-3	z-ai/glm-5-turbo	36821	6877	43698	0.0716932	2026-04-23T05:12:04.581Z	0
cmob0hlv7000112yd1oyvq599	\N	9dbe951e-cd69-4d23-8b1c-bc2639e6f9f9-3	openai/gpt-4o	2394	138	2532	0.007365000000000001	2026-04-23T04:58:55.603Z	0
cmob0hdg500035cs42qaaoqjp	3	9dbe951e-cd69-4d23-8b1c-bc2639e6f9f9-3	z-ai/glm-5-turbo	24174	734	24908	0.0319448	2026-04-23T04:58:44.693Z	0
cmoaychki00015cs4ljqdo9u8	3	9dbe951e-cd69-4d23-8b1c-bc2639e6f9f9-3	z-ai/glm-5-turbo	17552	2872	20424	0.0325504	2026-04-23T03:58:57.522Z	0
cmoav2odo0001nksj8efkaf04	58	bb405524-3234-4778-9b62-6beac7a9ebee-57	z-ai/glm-5-turbo	7193	750	7943	0.0116316	2026-04-23T02:27:20.940Z	0
cmo8r5vzb0005jhgmbmvbdp4p	89	c7f1aefd-2c9b-4caf-9f27-72b6091f7bf4-88	z-ai/glm-5-turbo	7943	2566	10509	0.0197956	2026-04-21T15:02:19.943Z	0
cmo8qw1xq0001glr85h94nwfk	\N	c7f1aefd-2c9b-4caf-9f27-72b6091f7bf4-88	openai/gpt-4o	534	108	642	0.002415	2026-04-21T14:54:41.102Z	0
cmo8qvtn90003jhgmyohs5wk6	89	c7f1aefd-2c9b-4caf-9f27-72b6091f7bf4-88	z-ai/glm-5-turbo	6550	2018	8568	0.015932	2026-04-21T14:54:30.357Z	0
cmo8qun8k00018ttxeg5q49qp	\N	c7f1aefd-2c9b-4caf-9f27-72b6091f7bf4-88	openai/gpt-4o	883	155	1038	0.0037575	2026-04-21T14:53:35.396Z	0
cmo8qudgb0001jhgm6o0h0bq3	89	c7f1aefd-2c9b-4caf-9f27-72b6091f7bf4-88	z-ai/glm-5-turbo	4808	97	4905	0.0061576	2026-04-21T14:53:22.715Z	0
cmo8ov52j0001wzagao0cffcu	89	c7f1aefd-2c9b-4caf-9f27-72b6091f7bf4-88	z-ai/glm-5-turbo	4392	738	5130	0.0082224	2026-04-21T13:57:59.275Z	0
cmo7g04u40001z7v9nxhhvn2t	\N	d3a31062-8e1b-4795-b1b0-47a8aa11989d-23	openai/gpt-4o	902	117	1019	0.003425	2026-04-20T17:02:09.532Z	0
cmo7fzx53000510vlv0yed9ip	23	d3a31062-8e1b-4795-b1b0-47a8aa11989d-23	z-ai/glm-5-turbo	5980	145	6125	0.007756	2026-04-20T17:01:59.559Z	0
cmo7fzr820001r8fl0q3kfz6o	\N	d3a31062-8e1b-4795-b1b0-47a8aa11989d-23	openai/gpt-4o	1708	114	1822	0.005410000000000001	2026-04-20T17:01:51.890Z	0
cmo7fzj4u000310vlkkpezpr5	23	d3a31062-8e1b-4795-b1b0-47a8aa11989d-23	z-ai/glm-5-turbo	5646	256	5902	0.007799199999999999	2026-04-20T17:01:41.406Z	0
cmo7f7fbh000110vl0jv9sa4z	23	d3a31062-8e1b-4795-b1b0-47a8aa11989d-23	z-ai/glm-5-turbo	4854	724	5578	0.008720799999999999	2026-04-20T16:39:50.093Z	0
cmo7er4yx00011c38yajqm16y	3	fb9bbee6-c5c9-4667-b57e-b7dcab4e0783-3	z-ai/glm-5-turbo	4946	436	5382	0.0076792	2026-04-20T16:27:10.185Z	0
cmo14y4c70001e0u7ianvfx6c	45	6bd1a838-dfeb-48e3-9d94-fc19c65f0d48-45	z-ai/glm-5-turbo	11214	2290	13504	0.0226168	2026-04-16T07:06:02.743Z	0
cmo14j5jd0001tf2vmeiq4es5	45	bf3b6b81-7985-4d81-a570-43504c75b798-45	z-ai/glm-5-turbo	7703	1764	9467	0.0162996	2026-04-16T06:54:24.457Z	0
cmo0v1pmz000112hoh30u51f0	3	f4857d87-01e7-4d95-972b-755db65adaf7-3	z-ai/glm-5-turbo	7913	1186	9099	0.0142396	2026-04-16T02:28:54.155Z	0
cmothun140001ibt987op4sfq	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	1050	114	1164	0.003765	2026-05-06T03:24:48.280Z	0
cmothufa3000510h1ex4tulnq	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	5677	524	6201	0.0089084	2026-05-06T03:24:38.235Z	0
cmothu0sk0001mz5idf40r8tr	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	1097	128	1225	0.0040225	2026-05-06T03:24:19.460Z	0
cmothtsox000310h1ubnltu3v	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	5088	641	5729	0.0086696	2026-05-06T03:24:08.961Z	0
cmothsxvw000110h1ons1g2c9	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	5180	195	5375	0.006996	2026-05-06T03:23:29.036Z	0
cmosa8kna0001806gt2vkcr2e	\N	9941dcce-243d-4332-bd27-dae2163823b6-45	openai/gpt-4o	2860	135	2995	0.0085	2026-05-05T07:03:55.270Z	0
cmosa8d0t0001cgk81phfm8ur	45	9941dcce-243d-4332-bd27-dae2163823b6-45	z-ai/glm-5-turbo	7669	1295	8964	0.0143828	2026-05-05T07:03:45.389Z	0
cmos6icor000111ynxjwm2fun	\N	22fbb909-c0b4-4d8f-833e-f731a54c5e89-3	openai/gpt-4o	761	123	884	0.0031325	2026-05-05T05:19:33.051Z	0
cmos6i4ks00035uwupzcnxgln	3	22fbb909-c0b4-4d8f-833e-f731a54c5e89-3	z-ai/glm-5-turbo	4636	179	4815	0.0062792	2026-05-05T05:19:22.540Z	0
cmos6hddv00015uwubapdb3oi	3	22fbb909-c0b4-4d8f-833e-f731a54c5e89-3	z-ai/glm-5-turbo	4381	239	4620	0.0062132	2026-05-05T05:18:47.299Z	0
cmor3p6aq00014706ru0ojkyk	37	ee09c3c7-3a22-4275-bfea-b54039b42276-37	z-ai/glm-5-turbo	7084	1139	8223	0.0130568	2026-05-04T11:13:06.338Z	0
cmor08h6z000110qry6vdpq9u	\N	616680be-dbe0-4682-a6a1-c3640ff8470d-97	openai/gpt-4o	627	123	750	0.002797500000000001	2026-05-04T09:36:08.459Z	0
cmor089o70003v1g9z4mmrn7g	99	616680be-dbe0-4682-a6a1-c3640ff8470d-97	z-ai/glm-5-turbo	16189	2603	18792	0.0298388	2026-05-04T09:35:58.711Z	0
cmor04pd20001v1g91tkibq4i	99	616680be-dbe0-4682-a6a1-c3640ff8470d-97	z-ai/glm-5-turbo	5995	588	6583	0.009545999999999999	2026-05-04T09:33:12.422Z	0
cmokw28bb0001w8zbfmj5bw2u	29	f174a0ea-3d5d-4115-8dd6-a93cb5aa559a	z-ai/glm-5-turbo	7029	206	7235	0.0092588	2026-04-30T02:52:41.495Z	0
cmoif11790001116wb86qh7ms	45	9941dcce-243d-4332-bd27-dae2163823b6-45	z-ai/glm-5-turbo	5464	2415	7879	0.0162168	2026-04-28T09:20:19.797Z	0
cmoich82000013oyq51iflgz8	\N	36a49583-283a-422e-8237-d872e01653d5	openai/gpt-4o	717	133	850	0.0031225	2026-04-28T08:08:56.328Z	0
cmoich0mv000313dzam54mofz	93	36a49583-283a-422e-8237-d872e01653d5	z-ai/glm-5-turbo	4637	540	5177	0.007724399999999999	2026-04-28T08:08:46.711Z	0
cmoicdwgj000113dz70p8q69s	93	36a49583-283a-422e-8237-d872e01653d5	z-ai/glm-5-turbo	4387	410	4797	0.0069044	2026-04-28T08:06:21.331Z	0
cmoicbhy700015lz65pgr5vpu	\N	6964777b-5fb3-4bc7-84fb-7a9d33813b0b	openai/gpt-4o	541	128	669	0.0026325	2026-04-28T08:04:29.215Z	0
cmoicb9sw0003lylyw4t9nrbw	93	6964777b-5fb3-4bc7-84fb-7a9d33813b0b	z-ai/glm-5-turbo	8191	686	8877	0.0125732	2026-04-28T08:04:18.656Z	0
cmogy1mdb0001nvhmrnrjv2hb	23	14301f44-f3e8-4c4a-ac3e-b0f59bda39ce-23	z-ai/glm-5-turbo	6338	2072	8410	0.0158936	2026-04-27T08:37:07.583Z	0
cmoclxf6900017pneoix6tjqa	91	f02bb6d1-9712-4e49-826e-b5b332b9b5de	z-ai/glm-5-turbo	4384	248	4632	0.006252799999999999	2026-04-24T07:46:51.537Z	0
cmocja8ru0001xcog1igriazv	3	5f0bd202-53c1-40b0-a280-9667a2789a1d-3	z-ai/glm-5-turbo	6853	490	7343	0.0101836	2026-04-24T06:32:50.922Z	0
cmobdt7ww0001xiu3ecpgwnk6	58	cddf4eb8-18ce-4609-9add-0176cd0606c9-57	z-ai/glm-5-turbo	7678	613	8291	0.0116656	2026-04-23T11:11:52.400Z	0
cmo02ppx10001gb6ey7bletc9	17	4be8c43d-c18b-4ee4-b0b6-1f3473f6fbb3-17	z-ai/glm-5-turbo	12669	541	13210	0.0173668	2026-04-15T13:15:45.397Z	0
cmo02lq2v00011323t0p57mis	17	36673487-d909-4ac4-9266-7f44b549719a-17	z-ai/glm-5-turbo	12110	311	12421	0.015776	2026-04-15T13:12:38.983Z	0
cmny9tnt600016w3jlb7euuq9	85	a297eabf-63fb-4537-bac4-0ed1f70e0c4b	z-ai/glm-5-turbo	4331	156	4487	0.0058212	2026-04-14T06:59:14.250Z	0
cmnt3i6o80001ghngrkvrpwf9	3	b60f174f-e153-473b-8bb6-d98e85029577-3	z-ai/glm-5-turbo	6912	1102	8014	0.0127024	2026-04-10T16:03:30.248Z	0
cmns9gfns0001v9gs2p34lrqs	\N	25e19a3e-a869-44ab-9729-d4825e2943c8-3	openai/gpt-4o	1423	144	1567	0.0049975	2026-04-10T02:02:20.104Z	0
cmns9fwje0001o337kuxh7n65	3	25e19a3e-a869-44ab-9729-d4825e2943c8-3	z-ai/glm-5-turbo	6614	1005	7619	0.0119568	2026-04-10T02:01:55.322Z	0
cmnrcvk5u00011uvbtognf2f9	3	25e19a3e-a869-44ab-9729-d4825e2943c8-3	z-ai/glm-5-turbo	8223	1080	9303	0.0141876	2026-04-09T10:50:18.450Z	0
cmnrbspnh0001phaeclns2eni	3	4a4883eb-e9fb-416f-9a03-02343c8ffbab-3	z-ai/glm-5-turbo	4953	657	5610	0.008571599999999999	2026-04-09T10:20:05.981Z	0
cmnraj8t40001gwe1fftgd7mr	75	9a6ee85d-1966-463c-b38b-d8d81cca9857	z-ai/glm-5-turbo	4382	1203	5585	0.0100704	2026-04-09T09:44:44.632Z	0
cmnrafw1a000111lqtsbbn7b6	\N	94623ca6-5d28-45a1-b1b8-1349f46a86f1-3	openai/gpt-4o	1071	134	1205	0.0040175	2026-04-09T09:42:08.110Z	0
cmnrafp7t000568zut4tgg0hy	3	94623ca6-5d28-45a1-b1b8-1349f46a86f1-3	z-ai/glm-5-turbo	15370	1980	17350	0.026364	2026-04-09T09:41:59.273Z	0
cmnra1y4y0001lvizzf7x9xit	\N	ac8d3c22-b074-43b2-a2c5-c7d502ac2eb3-3	openai/gpt-4o	1961	150	2111	0.0064025	2026-04-09T09:31:17.650Z	0
cmnra1r2v00035gvgxd8ff83x	3	ac8d3c22-b074-43b2-a2c5-c7d502ac2eb3-3	z-ai/glm-5-turbo	15511	1328	16839	0.0239252	2026-04-09T09:31:08.503Z	0
cmnr9qoj00001cl47zmklh6nv	\N	94623ca6-5d28-45a1-b1b8-1349f46a86f1-3	openai/gpt-4o	1664	159	1823	0.005750000000000001	2026-04-09T09:22:31.980Z	0
cmnr9qh6k000368zul2ixig5w	3	94623ca6-5d28-45a1-b1b8-1349f46a86f1-3	z-ai/glm-5-turbo	6097	571	6668	0.0096004	2026-04-09T09:22:22.460Z	0
cmnr9n3jh00015gvgo0e8kr32	3	ac8d3c22-b074-43b2-a2c5-c7d502ac2eb3-3	z-ai/glm-5-turbo	14215	1346	15561	0.022442	2026-04-09T09:19:44.813Z	0
cmnr9avoe000168zuuyb34pc5	3	94623ca6-5d28-45a1-b1b8-1349f46a86f1-3	z-ai/glm-5-turbo	5176	1216	6392	0.0110752	2026-04-09T09:10:14.750Z	0
cmnr8s1vr0001ofgni14lftwn	\N	9eea62b8-da14-4205-b1c6-f417e420be75-3	openai/gpt-4o	1767	139	1906	0.0058075	2026-04-09T08:55:36.327Z	0
cmnr8rupu0001273amnjkr3t5	3	9eea62b8-da14-4205-b1c6-f417e420be75-3	z-ai/glm-5-turbo	6249	1450	7699	0.0132988	2026-04-09T08:55:27.042Z	0
cmnr5j6rs0001upt3cs9p2ddb	45	f5d18837-6e98-415f-9360-4c78e7b4e1a7-45	z-ai/glm-5-turbo	4931	1728	6659	0.0128292	2026-04-09T07:24:43.912Z	0
cmo0cf3ok0001xovkq63zk3k5	\N	04abdb85-c056-49b7-a026-42872433d03c-9	openai/gpt-4o	9596	118	9714	0.02517	2026-04-15T17:47:26.180Z	0
cmo0cevb7000313y5iqan4njz	9	04abdb85-c056-49b7-a026-42872433d03c-9	z-ai/glm-5-turbo	13470	3262	16732	0.02921199999999999	2026-04-15T17:47:15.331Z	0
cmo0c5ujv000113y52859jxn8	9	04abdb85-c056-49b7-a026-42872433d03c-9	z-ai/glm-5-turbo	7275	2973	10248	0.020622	2026-04-15T17:40:14.443Z	0
cmo0bwb2q000110ggfzaemwn5	\N	efc43f4f-edcf-4579-8db6-e790f4641293-9	openai/gpt-4o	1431	151	1582	0.0050875	2026-04-15T17:32:49.298Z	0
cmo0bw2zj000hel8tp74ndi7w	9	efc43f4f-edcf-4579-8db6-e790f4641293-9	z-ai/glm-5-turbo	52215	3881	56096	0.07818199999999999	2026-04-15T17:32:38.815Z	0
cmo0bsfa1000124kygwyctp4r	\N	efc43f4f-edcf-4579-8db6-e790f4641293-9	openai/gpt-4o	4065	131	4196	0.0114725	2026-04-15T17:29:48.121Z	0
cmo0bs81c000fel8tc8n5967m	9	efc43f4f-edcf-4579-8db6-e790f4641293-9	z-ai/glm-5-turbo	47273	4096	51369	0.0731116	2026-04-15T17:29:38.736Z	0
cmo0bpmto00015i9p4bojiwfu	\N	efc43f4f-edcf-4579-8db6-e790f4641293-9	openai/gpt-4o	3653	136	3789	0.0104925	2026-04-15T17:27:37.932Z	0
cmo0bpeu3000del8tlql33tbv	9	efc43f4f-edcf-4579-8db6-e790f4641293-9	z-ai/glm-5-turbo	43668	3783	47451	0.0675336	2026-04-15T17:27:27.579Z	0
cmo0b7orr0001r05dzm9ni4qc	\N	efc43f4f-edcf-4579-8db6-e790f4641293-9	openai/gpt-4o	4619	145	4764	0.0129975	2026-04-15T17:13:40.647Z	0
cmo0b7gov000bel8tainem5p1	9	efc43f4f-edcf-4579-8db6-e790f4641293-9	z-ai/glm-5-turbo	40611	3336	43947	0.0620772	2026-04-15T17:13:30.175Z	0
cmo0avovd00013pah459ceq26	\N	efc43f4f-edcf-4579-8db6-e790f4641293-9	openai/gpt-4o	4381	127	4508	0.0122225	2026-04-15T17:04:20.905Z	0
cmo0avf820009el8tfr54mv2r	9	efc43f4f-edcf-4579-8db6-e790f4641293-9	z-ai/glm-5-turbo	36406	4096	40502	0.06007119999999999	2026-04-15T17:04:08.402Z	0
cmo0as8ld0001189ayjflvdw3	\N	efc43f4f-edcf-4579-8db6-e790f4641293-9	openai/gpt-4o	4477	129	4606	0.0124825	2026-04-15T17:01:39.841Z	0
cmo0as09d0007el8tkhd26b1n	9	efc43f4f-edcf-4579-8db6-e790f4641293-9	z-ai/glm-5-turbo	32343	4096	36439	0.0551956	2026-04-15T17:01:29.041Z	0
cmo0al2nw0001ybtdpchy52m2	\N	efc43f4f-edcf-4579-8db6-e790f4641293-9	openai/gpt-4o	4503	127	4630	0.0125275	2026-04-15T16:56:05.564Z	0
cmo0akurp0005el8tdvzp5zke	9	efc43f4f-edcf-4579-8db6-e790f4641293-9	z-ai/glm-5-turbo	28408	4096	32504	0.05047359999999999	2026-04-15T16:55:55.333Z	0
cmo09yng20001grj74y7wgffd	\N	efc43f4f-edcf-4579-8db6-e790f4641293-9	openai/gpt-4o	4703	136	4839	0.0131175	2026-04-15T16:38:39.410Z	0
cmo09yeqb0003el8ttnwbev8e	9	efc43f4f-edcf-4579-8db6-e790f4641293-9	z-ai/glm-5-turbo	24560	4178	28738	0.046184	2026-04-15T16:38:28.115Z	0
cmo07sqiu0001krrspeb16myg	\N	efc43f4f-edcf-4579-8db6-e790f4641293-9	openai/gpt-4o	6709	143	6852	0.0182025	2026-04-15T15:38:04.230Z	0
cmo07shqc0001el8tetwn8zxv	9	efc43f4f-edcf-4579-8db6-e790f4641293-9	z-ai/glm-5-turbo	18999	6144	25143	0.04737479999999999	2026-04-15T15:37:52.836Z	0
cmo03rpz30001k8m0exodbj36	\N	4be8c43d-c18b-4ee4-b0b6-1f3473f6fbb3-17	openai/gpt-4o	4578	135	4713	0.012795	2026-04-15T13:45:18.399Z	0
cmo03ri420001wqikt2x5hjwe	17	4be8c43d-c18b-4ee4-b0b6-1f3473f6fbb3-17	z-ai/glm-5-turbo	31273	6215	37488	0.0623876	2026-04-15T13:45:08.210Z	0
cmo039iz90001k1vbubiavk7i	\N	4be8c43d-c18b-4ee4-b0b6-1f3473f6fbb3-17	openai/gpt-4o	780	114	894	0.00309	2026-04-15T13:31:09.525Z	0
cmo039bto0001zs2s2m5cmf8r	17	4be8c43d-c18b-4ee4-b0b6-1f3473f6fbb3-17	z-ai/glm-5-turbo	14983	6151	21134	0.0425836	2026-04-15T13:31:00.252Z	0
cmnq7unix00015y0sqrlicx7g	3	3c5b93f4-77b8-431d-ad61-3469080732b5-3	z-ai/glm-5-turbo	4627	422	5049	0.007240399999999999	2026-04-08T15:41:51.897Z	0
cmnq7r7gz0001cqiyrart9d1l	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	698	135	833	0.003095000000000001	2026-04-08T15:39:11.123Z	0
cmnq7qzi20001dd15ypgk1vpa	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	16126	893	17019	0.0229232	2026-04-08T15:39:00.794Z	0
cmnpxakpc0001h9894390j4fk	\N	49d098d2-5958-4f47-b403-d8359f913170-3	openai/gpt-4o	1742	133	1875	0.005685000000000001	2026-04-08T10:46:18.960Z	0
cmnpxad6f00051qj9t4843vy0	3	49d098d2-5958-4f47-b403-d8359f913170-3	z-ai/glm-5-turbo	6970	735	7705	0.011304	2026-04-08T10:46:09.207Z	0
cmnpwyaxu0001b09i524nyj6d	\N	49d098d2-5958-4f47-b403-d8359f913170-3	openai/gpt-4o	1764	119	1883	0.005600000000000001	2026-04-08T10:36:46.434Z	0
cmnpwy2a200031qj968lh3cfi	3	49d098d2-5958-4f47-b403-d8359f913170-3	z-ai/glm-5-turbo	5714	1286	7000	0.0120008	2026-04-08T10:36:35.210Z	0
cmnpwt3e700011qj9xcf4l3fi	3	49d098d2-5958-4f47-b403-d8359f913170-3	z-ai/glm-5-turbo	4435	1311	5746	0.010566	2026-04-08T10:32:43.375Z	0
cmnpwgoe10001nvgjok9qxs5t	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1427	157	1584	0.005137500000000001	2026-04-08T10:23:04.057Z	0
cmnpwgghw0011n1soe4ykpuab	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	15897	167	16064	0.0197444	2026-04-08T10:22:53.828Z	0
cmnpw18pq000113wkr7wntws5	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1759	129	1888	0.005687500000000001	2026-04-08T10:11:03.902Z	0
cmnpw11df000zn1so5y2mtfcg	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	17372	686	18058	0.0235904	2026-04-08T10:10:54.387Z	0
cmnpvxyx60001ajr3sv310che	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1670	126	1796	0.005435000000000001	2026-04-08T10:08:31.242Z	0
cmnpvxr0y000xn1soht0a08uf	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	16303	786	17089	0.0227076	2026-04-08T10:08:21.010Z	0
cmnpvu8eg0001gdxgja7x4rhe	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1695	141	1836	0.0056475	2026-04-08T10:05:36.904Z	0
cmnpvu0x5000vn1so0pbn3pok	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	15075	974	16049	0.021986	2026-04-08T10:05:27.209Z	0
cmnpvp53c0001jtg63liypp7q	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1033	113	1146	0.003712500000000001	2026-04-08T10:01:39.336Z	0
cmnpvox9h000tn1sotbovea7a	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	14170	989	15159	0.02096	2026-04-08T10:01:29.189Z	0
cmnpvlyhb000322zn43c05pxd	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	952	128	1080	0.00366	2026-04-08T09:59:10.799Z	0
cmnqzx4ru00011kjpi7hbvidl	\N	278a97e6-0e9f-40dd-95ff-ce759da45411-3	openai/gpt-4o	3563	144	3707	0.0103475	2026-04-09T04:47:36.810Z	0
cmnqzwxbd0005g21hzst40rd5	3	278a97e6-0e9f-40dd-95ff-ce759da45411-3	z-ai/glm-5-turbo	15763	805	16568	0.0221356	2026-04-09T04:47:27.145Z	0
cmnqzita30003g21hpmt95ko3	3	278a97e6-0e9f-40dd-95ff-ce759da45411-3	z-ai/glm-5-turbo	12810	3098	15908	0.027764	2026-04-09T04:36:28.731Z	0
cmnqwq4fp0001ak9ae0q937ky	\N	9eea62b8-da14-4205-b1c6-f417e420be75-3	openai/gpt-4o	1282	156	1438	0.004765	2026-04-09T03:18:10.933Z	0
cmnqwpwc80007q5txx0n7otnv	3	9eea62b8-da14-4205-b1c6-f417e420be75-3	z-ai/glm-5-turbo	7114	1186	8300	0.0132808	2026-04-09T03:18:00.440Z	0
cmnqwasbk0001uvepjnwj9jjk	\N	9eea62b8-da14-4205-b1c6-f417e420be75-3	openai/gpt-4o	1309	149	1458	0.0047625	2026-04-09T03:06:15.392Z	0
cmnqwajio0005q5tx5cd8z7ox	3	9eea62b8-da14-4205-b1c6-f417e420be75-3	z-ai/glm-5-turbo	6328	918	7246	0.0112656	2026-04-09T03:06:03.984Z	0
cmnqw7p650001vro4e8rhyiid	\N	9eea62b8-da14-4205-b1c6-f417e420be75-3	openai/gpt-4o	1602	126	1728	0.005265000000000001	2026-04-09T03:03:51.341Z	0
cmnqw7h890003q5txxohbs8ua	3	9eea62b8-da14-4205-b1c6-f417e420be75-3	z-ai/glm-5-turbo	5539	797	6336	0.0098348	2026-04-09T03:03:41.049Z	0
cmnqvrezq0001q5txcgagfhbo	3	9eea62b8-da14-4205-b1c6-f417e420be75-3	z-ai/glm-5-turbo	4426	1102	5528	0.009719199999999999	2026-04-09T02:51:11.654Z	0
cmnqvo3yw0001g21hf0b6542n	3	278a97e6-0e9f-40dd-95ff-ce759da45411-3	z-ai/glm-5-turbo	6537	714	7251	0.0107004	2026-04-09T02:48:37.400Z	0
cmnq8yjkx00038599jtsg2u2x	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	545	131	676	0.0026725	2026-04-08T16:12:53.025Z	0
cmnq8ycti000hdd155zghaxtn	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	22148	163	22311	0.0272296	2026-04-08T16:12:44.262Z	0
cmnq8y0zc00018599ayby8fmd	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	757	122	879	0.0031125	2026-04-08T16:12:28.920Z	0
cmnq8xsy2000fdd157v2hkzj3	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	24192	129	24321	0.0295464	2026-04-08T16:12:18.506Z	0
cmnq8xdrk0001s3rgsve9qnj5	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1306	132	1438	0.004585000000000001	2026-04-08T16:11:58.832Z	0
cmnq8x40e000ddd15namyn6v1	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	23907	321	24228	0.0299724	2026-04-08T16:11:46.190Z	0
cmnq8vnyc0001aoss5wp5llyy	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1402	130	1532	0.004805	2026-04-08T16:10:38.724Z	0
cmnq8ve6y000bdd159a18304p	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	23099	874	23973	0.0312148	2026-04-08T16:10:26.074Z	0
cmnq8rgjs0001uiozi43flzhh	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1153	137	1290	0.0042525	2026-04-08T16:07:22.504Z	0
cmnq8r8nh0009dd15ve3t8600	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	22191	973	23164	0.0305212	2026-04-08T16:07:12.269Z	0
cmnq8l2va00014bpqnyomp8sg	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1254	120	1374	0.004335	2026-04-08T16:02:24.838Z	0
cmnq8kugz0005dd153g7djn57	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	19810	1780	21590	0.030892	2026-04-08T16:02:13.955Z	0
cmnq80akp00011418vh3s4prg	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1314	151	1465	0.004795000000000001	2026-04-08T15:46:15.049Z	0
cmnq802xf0003dd15l7yvgdtp	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	19041	741	19782	0.0258132	2026-04-08T15:46:05.139Z	0
cmnph1m860001kthpqn6lqz5v	\N	360b08e3-7723-4c4e-99a2-67f6a925413c-3	openai/gpt-4o	1057	146	1203	0.0041025	2026-04-08T03:11:27.174Z	0
cmnph1fnz0003zlkfyq03212s	3	360b08e3-7723-4c4e-99a2-67f6a925413c-3	z-ai/glm-5-turbo	3378	335	3713	0.0053936	2026-04-08T03:11:18.671Z	0
cmnpgyxmy0001zlkfgfmh2sxy	3	360b08e3-7723-4c4e-99a2-67f6a925413c-3	z-ai/glm-5-turbo	4382	192	4574	0.006026399999999999	2026-04-08T03:09:21.994Z	0
cmnpgy4sm0001xrirkqrf9gzz	3	20d87de6-6916-4786-b078-e6df511e0f0b-3	z-ai/glm-5-turbo	4382	191	4573	0.0060224	2026-04-08T03:08:44.614Z	0
cmnocgh6v0001rr5x3vkesktv	58	18742d7d-4445-48b3-8e75-762e77818726-57	z-ai/glm-5-turbo	7580	396	7976	0.01068	2026-04-07T08:15:16.231Z	0
cmnmjt67d000140j8xv1ax89l	60	55f44d6a-cce8-42de-818d-e5cda8f21926-59	z-ai/glm-5-turbo	4384	1127	5511	0.0097688	2026-04-06T02:05:33.481Z	0
cmnlx3s310001tw0rbrur7q1t	48	fa3ca705-fe4f-4aa6-9ad3-e0760c1472ad-48	z-ai/glm-5-turbo	4576	91	4667	0.0058552	2026-04-05T15:29:57.229Z	0
cmnk1rfan0001myjqh024uueg	65	4df68059-50ed-4071-8ad4-5350f8b8af9a	z-ai/glm-5-turbo	14960	1431	16391	0.023676	2026-04-04T08:04:46.511Z	0
cmnjttu8c0001o9baqtktzdtg	\N	07824c69-e3b8-46f4-9c29-38b47fa65cb4-23	openai/gpt-4o	1126	133	1259	0.004145	2026-04-04T04:22:42.252Z	0
cmnjttmx20005cjmsu2h9yp8v	23	07824c69-e3b8-46f4-9c29-38b47fa65cb4-23	z-ai/glm-5-turbo	6989	866	7855	0.0118508	2026-04-04T04:22:32.774Z	0
cmnjtdohk0001eiv9ez7hpfoa	\N	07824c69-e3b8-46f4-9c29-38b47fa65cb4-23	openai/gpt-4o	2409	88	2497	0.0069025	2026-04-04T04:10:08.312Z	0
cmnjtdgfr0003cjmsgniljhcy	23	07824c69-e3b8-46f4-9c29-38b47fa65cb4-23	z-ai/glm-5-turbo	6330	697	7027	0.010384	2026-04-04T04:09:57.879Z	0
cmnjt719f0001cjms3bkfc2pd	23	07824c69-e3b8-46f4-9c29-38b47fa65cb4-23	z-ai/glm-5-turbo	5165	1217	6382	0.011066	2026-04-04T04:04:58.275Z	0
cmnjsw7zu0001h8gbrpfvfguw	\N	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	openai/gpt-4o	1380	145	1525	0.004900000000000001	2026-04-04T03:56:33.786Z	0
cmnjsw0ok000dku2qio4nmh3t	23	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	z-ai/glm-5-turbo	24139	770	24909	0.0320468	2026-04-04T03:56:24.308Z	0
cmnjsqspw0001he1vxn54b1zh	\N	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	openai/gpt-4o	966	115	1081	0.003565	2026-04-04T03:52:20.708Z	0
cmnjsqm18000bku2qq74k2qel	23	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	z-ai/glm-5-turbo	23470	705	24175	0.030984	2026-04-04T03:52:12.044Z	0
cmnjsnx9e0001an0rbur4078y	\N	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	openai/gpt-4o	1855	147	2002	0.0061075	2026-04-04T03:50:06.626Z	0
cmnjsnq0c0009ku2qd52opcyw	23	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	z-ai/glm-5-turbo	22982	323	23305	0.0288704	2026-04-04T03:49:57.228Z	0
cmnjsm4tk0001smhmqp6osocx	\N	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	openai/gpt-4o	1624	131	1755	0.005370000000000001	2026-04-04T03:48:43.112Z	0
cmnpvlkin000122zn6vizw2a2	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	690	108	798	0.002805	2026-04-08T09:58:52.703Z	0
cmnpvld8s000pn1sovquz4zqm	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	13212	452	13664	0.0176624	2026-04-08T09:58:43.276Z	0
cmnpvkmhr000112gwos3p7mgi	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	823	117	940	0.0032275	2026-04-08T09:58:08.607Z	0
cmnpvkfac000nn1so4oeakori	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	12998	212	13210	0.0164456	2026-04-08T09:57:59.268Z	0
cmnpvjyv700015f0efdbwecq9	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1147	124	1271	0.0041075	2026-04-08T09:57:37.987Z	0
cmnpvjrgj000ln1sohkahezsa	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	12721	383	13104	0.0167972	2026-04-08T09:57:28.387Z	0
cmnpvhvbm00015u3et68u0u85	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	892	132	1024	0.00355	2026-04-08T09:56:00.082Z	0
cmnpvhogh000jn1somxywbgc1	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	12054	617	12671	0.0169328	2026-04-08T09:55:51.185Z	0
cmnpvfxq10001aho74nayiabf	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	2372	130	2502	0.00723	2026-04-08T09:54:29.881Z	0
cmnpvfqc9000hn1sofs4kx6t7	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	11649	425	12074	0.0156788	2026-04-08T09:54:20.313Z	0
cmnpvfcpj0001bzkmmnk6mvgq	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	3718	137	3855	0.010665	2026-04-08T09:54:02.647Z	0
cmnpvf55s000fn1sok9yhddda	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	10885	769	11654	0.016138	2026-04-08T09:53:52.864Z	0
cmnpve2iv0001ucf02taw6jj4	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	2214	113	2327	0.006665000000000001	2026-04-08T09:53:02.791Z	0
cmnpvdv9v000dn1so4gk1w0bw	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	8838	974	9812	0.0145016	2026-04-08T09:52:53.395Z	0
cmnpva3t800019maxk79o8xvh	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1105	146	1251	0.004222500000000001	2026-04-08T09:49:57.836Z	0
cmnpv9weo000bn1souh26uwpj	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	4941	524	5465	0.0080252	2026-04-08T09:49:48.240Z	0
cmnpurv8e000114kplx4prvzj	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	894	132	1026	0.003555	2026-04-08T09:35:46.910Z	0
cmnpurnta0009n1so13850ota	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	4315	798	5113	0.008369999999999999	2026-04-08T09:35:37.294Z	0
cmnpszbia0001evo16vxf0v6x	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	953	139	1092	0.0037725	2026-04-08T08:45:35.362Z	0
cmnpsz3i10007n1so84kkdoch	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	3883	433	4316	0.0063916	2026-04-08T08:45:24.985Z	0
cmnpsixab0001j4xu6rb3vxup	3	d95b5714-5d62-4713-aa56-b9994eaefdee-3	z-ai/glm-5-turbo	4387	622	5009	0.0077524	2026-04-08T08:32:50.435Z	0
cmnpsiceu0005n1sop64e8mci	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	5540	701	6241	0.009451999999999999	2026-04-08T08:32:23.382Z	0
cmnpsc3nt000110lifvneuzwn	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	612	93	705	0.00246	2026-04-08T08:27:32.105Z	0
cmnpsbwjh0003n1sovg3mdrre	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	5152	603	5755	0.008594399999999999	2026-04-08T08:27:22.877Z	0
cmnps9y9n0001n1so7yew8sg3	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	4382	159	4541	0.0058944	2026-04-08T08:25:51.803Z	0
cmnijq6k00001xawjphskpm0j	\N	86040f5a-41fe-4e98-97ef-197e45972528-3	openai/gpt-4o	3965	157	4122	0.0114825	2026-04-03T06:52:09.264Z	0
cmnijpxr10007fhjkr2ded530	3	86040f5a-41fe-4e98-97ef-197e45972528-3	z-ai/glm-5-turbo	11526	1657	13183	0.0204592	2026-04-03T06:51:57.853Z	0
cmnij90g10001g3eeahsl8i6f	\N	86040f5a-41fe-4e98-97ef-197e45972528-3	openai/gpt-4o	2554	132	2686	0.007705000000000001	2026-04-03T06:38:48.193Z	0
cmnij8s640005fhjkht6spaoc	3	86040f5a-41fe-4e98-97ef-197e45972528-3	z-ai/glm-5-turbo	8572	1982	10554	0.0182144	2026-04-03T06:38:37.468Z	0
cmnij4hbq0001fyauh2ctrrds	\N	86040f5a-41fe-4e98-97ef-197e45972528-3	openai/gpt-4o	3156	127	3283	0.009160000000000001	2026-04-03T06:35:16.790Z	0
cmnij4a9g0003fhjk5e39zrqc	3	86040f5a-41fe-4e98-97ef-197e45972528-3	z-ai/glm-5-turbo	7063	1115	8178	0.0129356	2026-04-03T06:35:07.636Z	0
cmniivxlt0001fhjkxoj7di8f	3	86040f5a-41fe-4e98-97ef-197e45972528-3	z-ai/glm-5-turbo	6162	634	6796	0.009930399999999999	2026-04-03T06:28:37.985Z	0
cmnih2dih0001111axp6delva	\N	87079033-fde1-4153-8f9a-5fd1ef25fda8-3	openai/gpt-4o	676	126	802	0.00295	2026-04-03T05:37:39.305Z	0
cmnih26w80003x1wedma5b34d	3	87079033-fde1-4153-8f9a-5fd1ef25fda8-3	z-ai/glm-5-turbo	4948	3963	8911	0.0217896	2026-04-03T05:37:30.728Z	0
cmnigz1j40001x1wefjcktwik	3	87079033-fde1-4153-8f9a-5fd1ef25fda8-3	z-ai/glm-5-turbo	4484	420	4904	0.0070608	2026-04-03T05:35:03.808Z	0
cmnicf8zz0007gjhgggwmy98s	3	48e24517-9129-49a1-b816-ae25c5c33a60-3	z-ai/glm-5-turbo	28032	3670	31702	0.0483184	2026-04-03T03:27:41.903Z	0
cmnicd7e50001xuaqqp9gwp6q	3	641e4d6b-4802-4d82-b5a9-d93dbc9a3e5c-3	z-ai/glm-5-turbo	4389	808	5197	0.008498799999999999	2026-04-03T03:26:06.509Z	0
cmnic8ruy0001ohrwgrqcor07	\N	48e24517-9129-49a1-b816-ae25c5c33a60-3	openai/gpt-4o	1469	140	1609	0.005072500000000001	2026-04-03T03:22:39.754Z	0
cmnic8kj00005gjhg5nvefn5k	3	48e24517-9129-49a1-b816-ae25c5c33a60-3	z-ai/glm-5-turbo	17430	540	17970	0.023076	2026-04-03T03:22:30.252Z	0
cmnic3p1w0003gjhgf82o4j18	3	48e24517-9129-49a1-b816-ae25c5c33a60-3	z-ai/glm-5-turbo	16497	1020	17517	0.0238764	2026-04-03T03:18:42.836Z	0
cmni9tj4b0001gjhgzsgu2q9e	3	48e24517-9129-49a1-b816-ae25c5c33a60-3	z-ai/glm-5-turbo	9887	814	10701	0.0151204	2026-04-03T02:14:49.355Z	0
cmnhcgv8p0001o52t35241wxo	\N	7a495337-3d41-434f-900c-b87fc4d936aa-17	openai/gpt-4o	1541	136	1677	0.0052125	2026-04-02T10:41:11.209Z	0
cmnhcgnbq0003tw1vlxj8shro	17	7a495337-3d41-434f-900c-b87fc4d936aa-17	z-ai/glm-5-turbo	175186	961	176147	0.2140672	2026-04-02T10:41:00.950Z	0
cmnhccjes0001tw1vv69qs4zs	17	7a495337-3d41-434f-900c-b87fc4d936aa-17	z-ai/glm-5-turbo	169473	1262	170735	0.2084156	2026-04-02T10:37:49.252Z	0
cmnjskao30001fh0t52oxwcd1	\N	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	openai/gpt-4o	1121	153	1274	0.0043325	2026-04-04T03:47:17.379Z	0
cmnjsk2t20005ku2qwoh1z6n7	23	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	z-ai/glm-5-turbo	20853	759	21612	0.0280596	2026-04-04T03:47:07.190Z	0
cmnjsa3850001ve389i42ylsg	\N	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	openai/gpt-4o	1524	132	1656	0.005130000000000001	2026-04-04T03:39:21.173Z	0
cmnjs9vcr0003ku2qb5xmdvch	23	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	z-ai/glm-5-turbo	21577	801	22378	0.0290964	2026-04-04T03:39:10.971Z	0
cmnjs6a9n0001ku2q4l7532fy	23	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	z-ai/glm-5-turbo	4389	1000	5389	0.009266799999999999	2026-04-04T03:36:23.675Z	0
cmnjr0imx0003ceyceaxnn8tf	23	2a4abf05-c458-41ff-86bf-81fa3ac61262-23	z-ai/glm-5-turbo	15961	1210	17171	0.0239932	2026-04-04T03:03:54.969Z	0
cmnjqxj930001ceyceli2xpy6	23	2a4abf05-c458-41ff-86bf-81fa3ac61262-23	z-ai/glm-5-turbo	9956	1379	11335	0.0174632	2026-04-04T03:01:35.799Z	0
cmnix7ckp0001hbep6ot8tctx	63	e20c9bde-7d00-4f78-bcfb-48fd480733cc	z-ai/glm-5-turbo	7262	346	7608	0.0100984	2026-04-03T13:09:25.225Z	0
cmniscgl8000113dn61dsqbaz	3	690ca703-c756-4d89-ba78-d320834426ec-3	z-ai/glm-5-turbo	4386	855	5241	0.0086832	2026-04-03T10:53:25.628Z	0
cmnis08jl0001syxjf238nntk	3	6e39eb04-8844-448d-9c18-8f3b4ca62f98-3	z-ai/glm-5-turbo	6935	673	7608	0.011014	2026-04-03T10:43:55.329Z	0
cmniqsl0d0001a6axuugjq6ck	\N	48e24517-9129-49a1-b816-ae25c5c33a60-3	openai/gpt-4o	2988	125	3113	0.00872	2026-04-03T10:09:58.621Z	0
cmniqsdzf0009gjhghez2s1ls	3	48e24517-9129-49a1-b816-ae25c5c33a60-3	z-ai/glm-5-turbo	37822	2415	40237	0.0550464	2026-04-03T10:09:49.515Z	0
cmnilt2b70001erbgsp9fflhp	\N	86040f5a-41fe-4e98-97ef-197e45972528-3	openai/gpt-4o	813	129	942	0.0033225	2026-04-03T07:50:22.963Z	0
cmnilsv2t000jfhjkmock8nzd	3	86040f5a-41fe-4e98-97ef-197e45972528-3	z-ai/glm-5-turbo	19850	1623	21473	0.030312	2026-04-03T07:50:13.589Z	0
cmnilpzrt0001xczqklfr0e24	\N	86040f5a-41fe-4e98-97ef-197e45972528-3	openai/gpt-4o	1608	101	1709	0.00503	2026-04-03T07:47:59.705Z	0
cmnilpt2x000hfhjk1helvejk	3	86040f5a-41fe-4e98-97ef-197e45972528-3	z-ai/glm-5-turbo	19573	323	19896	0.0247796	2026-04-03T07:47:51.033Z	0
cmnilnjp40001c1h17yozqbti	\N	86040f5a-41fe-4e98-97ef-197e45972528-3	openai/gpt-4o	3506	119	3625	0.009955	2026-04-03T07:46:05.560Z	0
cmnilnbqw000ffhjkisjctaqn	3	86040f5a-41fe-4e98-97ef-197e45972528-3	z-ai/glm-5-turbo	18535	1141	19676	0.026806	2026-04-03T07:45:55.256Z	0
cmnilgl1v0001hkx2in9jeghx	\N	86040f5a-41fe-4e98-97ef-197e45972528-3	openai/gpt-4o	3056	136	3192	0.009000000000000001	2026-04-03T07:40:40.723Z	0
cmnilgcrx000dfhjklgmkra8p	3	86040f5a-41fe-4e98-97ef-197e45972528-3	z-ai/glm-5-turbo	16832	1607	18439	0.0266264	2026-04-03T07:40:29.997Z	0
cmnil4xqr00013a9hsb5rjasu	\N	86040f5a-41fe-4e98-97ef-197e45972528-3	openai/gpt-4o	1502	127	1629	0.005025	2026-04-03T07:31:37.299Z	0
cmnil4qje000bfhjk25cgjxb8	3	86040f5a-41fe-4e98-97ef-197e45972528-3	z-ai/glm-5-turbo	14136	1278	15414	0.0220752	2026-04-03T07:31:27.962Z	0
cmnikijun0001jvszfhykcdzg	9	efc43f4f-edcf-4579-8db6-e790f4641293-9	z-ai/glm-5-turbo	16149	6906	23055	0.0470028	2026-04-03T07:14:12.863Z	0
cmnik84mu000177outuyyof0n	\N	86040f5a-41fe-4e98-97ef-197e45972528-3	openai/gpt-4o	2684	135	2819	0.008060000000000001	2026-04-03T07:06:06.582Z	0
cmnik7xlz0009fhjkpn4r2nns	3	86040f5a-41fe-4e98-97ef-197e45972528-3	z-ai/glm-5-turbo	12605	520	13125	0.017206	2026-04-03T07:05:57.479Z	0
cmngqsejw0001zibila36kmyn	18	a126bc74-4b63-4841-9a21-c1ea8ba6ede4-18	z-ai/glm-5-turbo	4383	544	4927	0.0074356	2026-04-02T00:34:17.900Z	0
cmnfxssct0001i2ubfujcppl3	\N	2c7c5a27-e660-4ac6-b6f7-7fba1fdc2726-55	openai/gpt-4o	978	118	1096	0.003625	2026-04-01T11:02:46.925Z	0
cmnfxslal0005ry5x69zjqizy	56	2c7c5a27-e660-4ac6-b6f7-7fba1fdc2726-55	z-ai/glm-5-turbo	12053	502	12555	0.0164716	2026-04-01T11:02:37.773Z	0
cmnfxqp8b0001dkgajet9eicm	\N	2c7c5a27-e660-4ac6-b6f7-7fba1fdc2726-55	openai/gpt-4o	1293	148	1441	0.004712500000000001	2026-04-01T11:01:09.563Z	0
cmnfxqgnq0003ry5xa4udjp5a	56	2c7c5a27-e660-4ac6-b6f7-7fba1fdc2726-55	z-ai/glm-5-turbo	11698	636	12334	0.0165816	2026-04-01T11:00:58.454Z	0
cmnfxoxwy0001ry5x5vxailre	56	2c7c5a27-e660-4ac6-b6f7-7fba1fdc2726-55	z-ai/glm-5-turbo	7753	844	8597	0.0126796	2026-04-01T10:59:47.506Z	0
cmnfrlxkb000113b5u34sz3pe	45	06ab8490-20f6-471e-852c-975af3895181-45	z-ai/glm-5-turbo	4737	508	5245	0.0077164	2026-04-01T08:09:29.387Z	0
cmnfrdd390001tmy9w6opy750	\N	78e22122-0619-46db-9373-008872eec04c-45	openai/gpt-4o	3309	142	3451	0.0096925	2026-04-01T08:02:49.605Z	0
cmnfrd4lq00031300ejkrw6op	45	78e22122-0619-46db-9373-008872eec04c-45	z-ai/glm-5-turbo	8495	1711	10206	0.017038	2026-04-01T08:02:38.606Z	0
cmnfoqku800011300dgsl6b3k	45	78e22122-0619-46db-9373-008872eec04c-45	z-ai/glm-5-turbo	4755	2622	7377	0.016194	2026-04-01T06:49:07.328Z	0
cmnfg3png000111u1mwyzm29v	47	f9d65f4c-b2ed-4a99-bbac-57cf0c02cd08-47	z-ai/glm-5-turbo	4385	755	5140	0.008282	2026-04-01T02:47:23.548Z	0
cmneo3h3z00014lkrue2ku1lf	52	07374640-8c56-4543-9854-f975116fbcef	z-ai/glm-5-turbo	4406	172	4578	0.0059752	2026-03-31T13:43:23.231Z	0
cmnei20o2000111z2vte151ck	\N	b4efeed1-39da-400e-8f94-538fbe9cc3aa-47	openai/gpt-4o	1417	119	1536	0.004732500000000001	2026-03-31T10:54:17.570Z	0
cmnei1t94000brakh8uf4nens	47	b4efeed1-39da-400e-8f94-538fbe9cc3aa-47	z-ai/glm-5-turbo	34183	3840	38023	0.05637959999999999	2026-03-31T10:54:07.960Z	0
cmneh9vqe000113wy9uk932np	\N	b4efeed1-39da-400e-8f94-538fbe9cc3aa-47	openai/gpt-4o	1659	130	1789	0.0054475	2026-03-31T10:32:24.806Z	0
cmneh9d9x0009rakhfimj6oei	47	b4efeed1-39da-400e-8f94-538fbe9cc3aa-47	z-ai/glm-5-turbo	33269	954	34223	0.0437388	2026-03-31T10:32:00.885Z	0
cmneh7ium0001t3z56xb3ya38	\N	b4efeed1-39da-400e-8f94-538fbe9cc3aa-47	openai/gpt-4o	1523	149	1672	0.0052975	2026-03-31T10:30:34.798Z	0
cmneh7b510007rakh4jp4tccg	47	b4efeed1-39da-400e-8f94-538fbe9cc3aa-47	z-ai/glm-5-turbo	31455	1153	32608	0.04235799999999999	2026-03-31T10:30:24.805Z	0
cmneh3wvu0001b8oxjpn8d2i8	\N	b4efeed1-39da-400e-8f94-538fbe9cc3aa-47	openai/gpt-4o	747	120	867	0.0030675	2026-03-31T10:27:46.362Z	0
cmneh3p5s0005rakhtqj2803n	47	b4efeed1-39da-400e-8f94-538fbe9cc3aa-47	z-ai/glm-5-turbo	22624	1309	23933	0.0323848	2026-03-31T10:27:36.352Z	0
cmnh8fyc30003ef34vom04zd1	60	8faf0fae-f102-4cf0-88ab-9b1bac30d9fb	z-ai/glm-5-turbo	15739	1913	17652	0.0265388	2026-04-02T08:48:30.099Z	0
cmnh8bpja0001ef34izlq88ng	60	8faf0fae-f102-4cf0-88ab-9b1bac30d9fb	z-ai/glm-5-turbo	6677	477	7154	0.0099204	2026-04-02T08:45:12.070Z	0
cmnh69fbv0001d9prpjlkchnd	58	c775f254-39f3-4649-bf62-e6189b0c7fda-57	z-ai/glm-5-turbo	4387	325	4712	0.0065644	2026-04-02T07:47:26.299Z	0
cmnh3fgx40001q5pi7fh6c9x2	3	c1dacbd2-9c90-42c2-8235-23000dc115e4-3	z-ai/glm-5-turbo	21773	1161	22934	0.0307716	2026-04-02T06:28:09.448Z	0
cmngz8bph000146kkii5zhxss	59	73401624-4836-4783-9e03-dc3581dff793	z-ai/glm-5-turbo	4383	106	4489	0.0056836	2026-04-02T04:30:37.637Z	0
cmngvblc2000bnhejs3paclxp	\N	de241558-fb6e-4064-8878-0d85476c7bd7-57	openai/gpt-4o	892	125	1017	0.00348	2026-04-02T02:41:11.618Z	0
cmngvbiv20009nhejrqe3zai5	\N	de241558-fb6e-4064-8878-0d85476c7bd7-57	openai/gpt-4o	4524	141	4665	0.01272	2026-04-02T02:41:08.414Z	0
cmngvbgqo0007nhejrytu4tjp	\N	de241558-fb6e-4064-8878-0d85476c7bd7-57	openai/gpt-4o	677	118	795	0.0028725	2026-04-02T02:41:05.664Z	0
cmngvbeox0005nhejwch6waol	\N	de241558-fb6e-4064-8878-0d85476c7bd7-57	openai/gpt-4o	801	114	915	0.0031425	2026-04-02T02:41:03.009Z	0
cmngvbcno0003nhejglqbpfug	\N	de241558-fb6e-4064-8878-0d85476c7bd7-57	openai/gpt-4o	728	112	840	0.00294	2026-04-02T02:41:00.372Z	0
cmngvb8r20001nhejo68s00yy	\N	de241558-fb6e-4064-8878-0d85476c7bd7-57	openai/gpt-4o	951	128	1079	0.0036575	2026-04-02T02:40:55.310Z	0
cmnguwzm0000jmvoltnz3cpn7	58	de241558-fb6e-4064-8878-0d85476c7bd7-57	z-ai/glm-5-turbo	19474	353	19827	0.0247808	2026-04-02T02:29:50.280Z	0
cmngunc19000hmvold3mr8yiw	58	de241558-fb6e-4064-8878-0d85476c7bd7-57	z-ai/glm-5-turbo	19051	521	19572	0.0249452	2026-04-02T02:22:19.821Z	0
cmngujblb000fmvolpw04votv	58	de241558-fb6e-4064-8878-0d85476c7bd7-57	z-ai/glm-5-turbo	16363	496	16859	0.0216196	2026-04-02T02:19:12.623Z	0
cmnguenf3000dmvoleuop7al4	58	de241558-fb6e-4064-8878-0d85476c7bd7-57	z-ai/glm-5-turbo	12297	4096	16393	0.0311404	2026-04-02T02:15:34.671Z	0
cmngudjlg000bmvol2uu91j9q	58	de241558-fb6e-4064-8878-0d85476c7bd7-57	z-ai/glm-5-turbo	11917	393	12310	0.0158724	2026-04-02T02:14:43.060Z	0
cmngucyvy0009mvolwz35t74t	58	de241558-fb6e-4064-8878-0d85476c7bd7-57	z-ai/glm-5-turbo	11577	479	12056	0.0158084	2026-04-02T02:14:16.222Z	0
cmngucf4r0007mvol7zbtyl8n	58	de241558-fb6e-4064-8878-0d85476c7bd7-57	z-ai/glm-5-turbo	11373	226	11599	0.0145516	2026-04-02T02:13:50.619Z	0
cmngua4en0001bpnftqjqkqt3	\N	de241558-fb6e-4064-8878-0d85476c7bd7-57	openai/gpt-4o	6525	135	6660	0.0176625	2026-04-02T02:12:03.407Z	0
cmngu9w940005mvolrz1fhgxg	58	de241558-fb6e-4064-8878-0d85476c7bd7-57	z-ai/glm-5-turbo	10908	265	11173	0.0141496	2026-04-02T02:11:52.840Z	0
cmngu926s0003mvolf7nxcqp6	58	de241558-fb6e-4064-8878-0d85476c7bd7-57	z-ai/glm-5-turbo	4902	6144	11046	0.0304584	2026-04-02T02:11:13.876Z	0
cmngqzcuf0001jozmgj2ub64n	\N	a126bc74-4b63-4841-9a21-c1ea8ba6ede4-18	openai/gpt-4o	1106	115	1221	0.003915	2026-04-02T00:39:42.279Z	0
cmngqz5940005zibimgl3tkfv	18	a126bc74-4b63-4841-9a21-c1ea8ba6ede4-18	z-ai/glm-5-turbo	5510	1196	6706	0.011396	2026-04-02T00:39:32.440Z	0
cmngqvm2v0001b188ro0z4ida	\N	a126bc74-4b63-4841-9a21-c1ea8ba6ede4-18	openai/gpt-4o	968	130	1098	0.00372	2026-04-02T00:36:47.623Z	0
cmngqvdp40003zibirze0ede2	18	a126bc74-4b63-4841-9a21-c1ea8ba6ede4-18	z-ai/glm-5-turbo	4877	672	5549	0.0085404	2026-04-02T00:36:36.760Z	0
cmplbyzss000413yk9l5eh63k	124	8b1f351f-141d-4e2c-96b5-fa2d0d007583	z-ai/glm-5-turbo	5449	3426	8875	0.0202428	2026-05-25T14:57:46.684Z	0
cmpgyjcr10005wfpa2n731lou	123	24041aa0-64ae-443f-baab-ce37eacf110f	z-ai/glm-5-turbo	23626	604	24230	0.0307672	2026-05-22T13:30:37.261Z	0
cmpc7722e0001m00216892qrw	\N	46cdcaec-0dd3-45d6-8c73-433799491e94-57	openai/gpt-4o	1147	134	1281	0.0042075	2026-05-19T05:34:09.206Z	0
cmp6o9nh00001inrxhyf6gzjx	17	4be8c43d-c18b-4ee4-b0b6-1f3473f6fbb3-17	z-ai/glm-5-turbo	43504	2920	46424	0.06388479999999999	2026-05-15T08:45:26.676Z	0
cmp0vmdn50001190c6ed2q9s2	\N	fd45d589-22db-49e0-9cdb-4866ab3a7d21-29	openai/gpt-4o	1061	139	1200	0.004042500000000001	2026-05-11T07:24:40.721Z	0
cmouuye3i0007xfh3bd1t3qid	58	759aa993-f5e0-4cc6-81c4-3e3c01ca7179-57	z-ai/glm-5-turbo	6445	2361	8806	0.017178	2026-05-07T02:19:24.510Z	0
cmous9i2g0001253apzg2y9q8	\N	b7e3a11c-de8e-40cb-b84e-bf93fefba984-57	openai/gpt-4o	3106	139	3245	0.009155000000000002	2026-05-07T01:04:04.024Z	0
cmotlpxop0001x0cf4y2elkta	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	1281	116	1397	0.0043625	2026-05-06T05:13:07.273Z	0
cmothw7sv000710h18zez6jul	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	6739	546	7285	0.0102708	2026-05-06T03:26:01.855Z	0
cmoic9wvk0001lylybtgpoo90	93	6964777b-5fb3-4bc7-84fb-7a9d33813b0b	z-ai/glm-5-turbo	4378	113	4491	0.0057056	2026-04-28T08:03:15.248Z	0
cmo0ua15e0001hr8wlpui1cyc	3	2a5abd11-8531-4c44-a9c5-a938bb86b558-3	z-ai/glm-5-turbo	9457	899	10356	0.0149444	2026-04-16T02:07:22.706Z	0
cmnil9lbk0001ke1d9oyhzhk1	3	2993cbe3-8cac-4a7f-ad96-02fd225615c3-3	z-ai/glm-5-turbo	4388	550	4938	0.007465599999999999	2026-04-03T07:35:14.480Z	0
cmndgenmr0003amg835m9ve2n	3	7991c015-cd9c-41e9-a65c-4cb70a2672ff-3	z-ai/glm-5-turbo	8230	340	8570	0.011236	2026-03-30T17:20:21.795Z	0
cmndgdwlg000110t4vq2acw20	\N	7991c015-cd9c-41e9-a65c-4cb70a2672ff-3	openai/gpt-4o	1203	123	1326	0.0042375	2026-03-30T17:19:46.756Z	0
cmndgdp2u0001amg8iuvxhmze	3	7991c015-cd9c-41e9-a65c-4cb70a2672ff-3	z-ai/glm-5-turbo	7649	228	7877	0.0100908	2026-03-30T17:19:37.014Z	0
cmndftb3w00015g1uqla0bim6	3	7991c015-cd9c-41e9-a65c-4cb70a2672ff-3	z-ai/glm-5-turbo	7044	684	7728	0.0111888	2026-03-30T17:03:45.788Z	0
cmndfdfds0001kc094c0axfgs	3	d93a81f4-c8e2-4c16-8da2-ecb1eb5d0751-3	z-ai/glm-5-turbo	4397	572	4969	0.0075644	2026-03-30T16:51:24.832Z	0
cmndco6gt000bf5a9wt4lk2kk	3	2444ea90-577b-4aff-ae1f-dc0d378ca6da-3	z-ai/glm-5-turbo	6758	279	7037	0.0092256	2026-03-30T15:35:47.645Z	0
cmnh8g6b7000114bkly62phgl	\N	8faf0fae-f102-4cf0-88ab-9b1bac30d9fb	openai/gpt-4o	931	144	1075	0.0037675	2026-04-02T08:48:40.435Z	0
cmngu7o910001mvolwrlkx03o	58	de241558-fb6e-4064-8878-0d85476c7bd7-57	z-ai/glm-5-turbo	4390	320	4710	0.006548	2026-04-02T02:10:09.157Z	0
cmneh27ud0003rakhshp8im94	47	b4efeed1-39da-400e-8f94-538fbe9cc3aa-47	z-ai/glm-5-turbo	23492	4096	27588	0.0445744	2026-03-31T10:26:27.253Z	0
cmnegvrnf0001rakhqde1wv0j	47	b4efeed1-39da-400e-8f94-538fbe9cc3aa-47	z-ai/glm-5-turbo	7661	1133	8794	0.0137252	2026-03-31T10:21:26.331Z	0
cmndyz6if0001wwb849pdtcrg	9	a7e6d874-0076-4bc2-bdb0-5b9684aed263-9	z-ai/glm-5-turbo	4386	510	4896	0.007303199999999999	2026-03-31T02:00:12.471Z	0
cmndgjfmx0001p50neqsjmm4l	\N	7991c015-cd9c-41e9-a65c-4cb70a2672ff-3	openai/gpt-4o	837	161	998	0.0037025	2026-03-30T17:24:04.713Z	0
cmndgj6nq0007amg8z7kfwlj6	3	7991c015-cd9c-41e9-a65c-4cb70a2672ff-3	z-ai/glm-5-turbo	9578	827	10405	0.0148016	2026-03-30T17:23:53.078Z	0
cmndggbe600019yxp3j5dgayc	\N	7991c015-cd9c-41e9-a65c-4cb70a2672ff-3	openai/gpt-4o	829	113	942	0.0032025	2026-03-30T17:21:39.246Z	0
cmndgg3mu0005amg827dd6p8z	3	7991c015-cd9c-41e9-a65c-4cb70a2672ff-3	z-ai/glm-5-turbo	8848	350	9198	0.0120176	2026-03-30T17:21:29.190Z	0
cmndgeufs0001dcbn8ki80pf5	\N	7991c015-cd9c-41e9-a65c-4cb70a2672ff-3	openai/gpt-4o	534	125	659	0.002585	2026-03-30T17:20:30.616Z	0
cmo07g3lb0001dsdad6l7448x	3	1fd499ec-0271-4f0c-a7f7-de637d508bd8-3	z-ai/glm-5-turbo	6749	950	7699	0.0118988	2026-04-15T15:28:14.639Z	0
cmnr1xgal0001vteiqs924xa1	45	9d400a86-1919-4d92-a6d1-d74a001e30e8-45	z-ai/glm-5-turbo	4905	1186	6091	0.01063	2026-04-09T05:43:50.973Z	0
cmnq8p8ys0001jzerq1v8y747	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	2297	125	2422	0.0069925	2026-04-08T16:05:39.364Z	0
cmnpvlryt000rn1sofn89dhyj	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	13665	681	14346	0.019122	2026-04-08T09:59:02.357Z	0
cmnpsijv40001qke22eoxrnih	\N	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	openai/gpt-4o	1081	155	1236	0.0042525	2026-04-08T08:32:33.040Z	0
cmndf7u6u0001tlctuubjmio9	\N	f7e3a57b-e9cd-4e92-8018-f3348128e398-3	openai/gpt-4o	3157	152	3309	0.0094125	2026-03-30T16:47:04.086Z	0
cmndf7mi3000311t8s7lliksb	3	f7e3a57b-e9cd-4e92-8018-f3348128e398-3	z-ai/glm-5-turbo	7113	952	8065	0.0123436	2026-03-30T16:46:54.123Z	0
cmndf2oqa000111t8pz5u0cle	3	f7e3a57b-e9cd-4e92-8018-f3348128e398-3	z-ai/glm-5-turbo	5164	631	5795	0.008720799999999999	2026-03-30T16:43:03.730Z	0
cmndeu3nl0001e9pd0aw76bny	\N	fae845f9-a728-4b69-8865-fd67d8c81521-3	openai/gpt-4o	1034	122	1156	0.003805	2026-03-30T16:36:23.169Z	0
cmndetvhj0001amxz43rhck2m	3	fae845f9-a728-4b69-8865-fd67d8c81521-3	z-ai/glm-5-turbo	5341	448	5789	0.008201199999999999	2026-03-30T16:36:12.583Z	0
cmndcpr8b0001m7od91dp625l	\N	2444ea90-577b-4aff-ae1f-dc0d378ca6da-3	openai/gpt-4o	788	131	919	0.00328	2026-03-30T15:37:01.211Z	0
cmndcpjl0000df5a925pahspu	3	2444ea90-577b-4aff-ae1f-dc0d378ca6da-3	z-ai/glm-5-turbo	7066	525	7591	0.0105792	2026-03-30T15:36:51.300Z	0
cmndcodbj0001tfic7z2sop6x	\N	2444ea90-577b-4aff-ae1f-dc0d378ca6da-3	openai/gpt-4o	810	128	938	0.003305000000000001	2026-03-30T15:35:56.527Z	0
cmnjslx4a0007ku2q4yawvs6c	23	26766f0f-73ae-4e53-b0bb-43c79030cb01-23	z-ai/glm-5-turbo	22039	1092	23131	0.0308148	2026-04-04T03:48:33.130Z	0
cmndckplq0009f5a9msnnk5yt	3	2444ea90-577b-4aff-ae1f-dc0d378ca6da-3	z-ai/glm-5-turbo	6398	339	6737	0.0090336	2026-03-30T15:33:05.822Z	0
cmndcju8f0001gmhzikjvlrhm	\N	2444ea90-577b-4aff-ae1f-dc0d378ca6da-3	openai/gpt-4o	1337	138	1475	0.004722500000000001	2026-03-30T15:32:25.167Z	0
cmndcjll90007f5a9qyn2965p	3	2444ea90-577b-4aff-ae1f-dc0d378ca6da-3	z-ai/glm-5-turbo	5931	498	6429	0.0091092	2026-03-30T15:32:13.965Z	0
cmotikww30001q6pownpugtib	\N	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	openai/gpt-4o	1815	153	1968	0.006067500000000001	2026-05-06T03:45:14.115Z	0
cmotikoxg000h10h17zotqwte	23	35ff3bba-bf59-499d-955a-8bf7c503b9dd-23	z-ai/glm-5-turbo	12325	450	12775	0.01659	2026-05-06T03:45:03.796Z	0
cmnq8p1du0007dd15qtk63m2c	3	e1992c5d-ee92-443b-9ae7-1eec50d341df-3	z-ai/glm-5-turbo	21592	673	22265	0.0286024	2026-04-08T16:05:29.538Z	0
cmnjr0r2a0001lgidqxc6unl0	\N	2a4abf05-c458-41ff-86bf-81fa3ac61262-23	openai/gpt-4o	1840	143	1983	0.006030000000000001	2026-04-04T03:04:05.890Z	0
cmndckx7q0001qb48cdld4t5r	\N	2444ea90-577b-4aff-ae1f-dc0d378ca6da-3	openai/gpt-4o	1291	135	1426	0.0045775	2026-03-30T15:33:15.686Z	0
\.


--
-- Data for Name: releases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.releases (id, name, start_date, end_date, notes, created_at) FROM stdin;
1	Release 1	2026-03-22	2026-05-26	First rollout to Savameta	2026-05-26 07:42:31.167445+00
2	Release 2	2026-05-27	\N	Second rollout — ongoing	2026-05-26 07:42:31.167445+00
\.


--
-- Data for Name: sync_state; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sync_state (id, "lastSyncAt", "totalRecords", status) FROM stdin;
1	2026-05-27T00:16:11.969Z	813	idle
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users ("userId", "firstName", "lastName", email, "avatarUrl", "userName", "updatedAt", first_seen_at, last_active_at) FROM stdin;
188			kk@gmail.com	\N	kkkk	2026-05-26T07:45:35.278Z	2026-05-25 01:50:45.713+00	2026-05-25 01:50:45.713+00
126	Test	User	test@lumilink.local	\N	test	\N	\N	\N
117	Khang	Nguyen Tai	khangnt@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocItFzEWqBsy1d8q708GN8nnG_DMQISn79uDH-FJLP4F0QiQwg=s96-c	khangnt@savameta.com	\N	\N	\N
116	\N	\N	anon-25bed92d-84b7-468b-9af1-ddbce81bd3a3@anon.lumilink	\N	anon-25bed92d-84b7-468b-9af1-ddbce81bd3a3	\N	2026-05-13 09:44:27.879+00	2026-05-13 09:44:27.879+00
113	\N	\N	anon-e7019df1-d66c-4123-8d9c-bc38bb5585e5@anon.lumilink	\N	anon-e7019df1-d66c-4123-8d9c-bc38bb5585e5	\N	\N	\N
112	\N	\N	anon-9d84e569-fe9e-46cf-9838-2ed6097cd9a4@anon.lumilink	\N	anon-9d84e569-fe9e-46cf-9838-2ed6097cd9a4	\N	\N	\N
111	\N	\N	anon-746b4117-ba5b-4847-9d55-7c8b697edbeb@anon.lumilink	\N	anon-746b4117-ba5b-4847-9d55-7c8b697edbeb	\N	\N	\N
110	\N	\N	anon-fa9604f0-0995-46fd-b3a3-d0aa25c933da@anon.lumilink	\N	anon-fa9604f0-0995-46fd-b3a3-d0aa25c933da	\N	\N	\N
108	\N	\N	anon-323dd9c8-4c7e-4379-9a8c-aff5446e762e@anon.lumilink	\N	anon-323dd9c8-4c7e-4379-9a8c-aff5446e762e	\N	\N	\N
104	\N	\N	anon-c277181c-c202-4d2a-a8ed-19f84c16bf46@anon.lumilink	\N	anon-c277181c-c202-4d2a-a8ed-19f84c16bf46	\N	\N	\N
103	\N	\N	anon-eb1549c9-2952-49d3-ab62-a8f64d3dc227@anon.lumilink	\N	anon-eb1549c9-2952-49d3-ab62-a8f64d3dc227	\N	\N	\N
100	\N	\N	anon-fb0f091b-4d70-4378-971b-a577bfd2e4cf@anon.lumilink	\N	anon-fb0f091b-4d70-4378-971b-a577bfd2e4cf	\N	\N	\N
97	\N	\N	anon-211f42fd-133a-4cd4-bc57-f62f9f2ae48a@anon.lumilink	\N	anon-211f42fd-133a-4cd4-bc57-f62f9f2ae48a	\N	\N	\N
96	\N	\N	anon-8118597d-c4a1-40ef-8ae5-cfce83ba16d1@anon.lumilink	\N	anon-8118597d-c4a1-40ef-8ae5-cfce83ba16d1	\N	\N	\N
90	\N	\N	anon-8dc214cc-50d7-48e4-93ce-2aee96bcaee9@anon.lumilink	\N	anon-8dc214cc-50d7-48e4-93ce-2aee96bcaee9	\N	\N	\N
87	\N	\N	anon-d6103505-d293-45c9-9f95-98581e1defa9@anon.lumilink	\N	anon-d6103505-d293-45c9-9f95-98581e1defa9	\N	\N	\N
86	\N	\N	anon-913bc19e-5047-4b05-a06a-abbcd58382b8@anon.lumilink	\N	anon-913bc19e-5047-4b05-a06a-abbcd58382b8	\N	\N	\N
84	\N	\N	anon-2c7baac3-327c-4718-b9dc-9b0d408e0043@anon.lumilink	\N	anon-2c7baac3-327c-4718-b9dc-9b0d408e0043	\N	\N	\N
82	\N	\N	anon-3ba91099-2a7f-4b4c-a7ed-d678fd901677@anon.lumilink	\N	anon-3ba91099-2a7f-4b4c-a7ed-d678fd901677	\N	\N	\N
81	\N	\N	anon-28d3b13a-af50-4087-a5a2-5680f0f02c00@anon.lumilink	\N	anon-28d3b13a-af50-4087-a5a2-5680f0f02c00	\N	\N	\N
78	\N	\N	anon-ce5936ff-70a6-4aab-a3b8-ade7d7d1d4e1@anon.lumilink	\N	anon-ce5936ff-70a6-4aab-a3b8-ade7d7d1d4e1	\N	\N	\N
77	\N	\N	anon-db568152-5b34-4b60-8526-a82776b48a5a@anon.lumilink	\N	anon-db568152-5b34-4b60-8526-a82776b48a5a	\N	\N	\N
76	\N	\N	anon-a7b2d448-7553-4239-8fab-df880b1c16d1@anon.lumilink	\N	anon-a7b2d448-7553-4239-8fab-df880b1c16d1	\N	\N	\N
74	\N	\N	anon-58efe1ed-df63-4b86-84be-a479ce6b29bd@anon.lumilink	\N	anon-58efe1ed-df63-4b86-84be-a479ce6b29bd	\N	\N	\N
73	\N	\N	anon-8ea8315d-a733-43d3-b370-901b18065300@anon.lumilink	\N	anon-8ea8315d-a733-43d3-b370-901b18065300	\N	\N	\N
72	\N	\N	anon-a944a652-2bd2-4ea3-9b65-37a8773ca880@anon.lumilink	\N	anon-a944a652-2bd2-4ea3-9b65-37a8773ca880	\N	\N	\N
71	\N	\N	anon-0cf2e776-d628-4173-b29a-902c832e49c0@anon.lumilink	\N	anon-0cf2e776-d628-4173-b29a-902c832e49c0	\N	\N	\N
70	\N	\N	anon-e291f4e1-25e8-434f-884a-fac34db41195@anon.lumilink	\N	anon-e291f4e1-25e8-434f-884a-fac34db41195	\N	\N	\N
69	\N	\N	anon-e4abe9db-4ce7-4142-9fc5-44d273501240@anon.lumilink	\N	anon-e4abe9db-4ce7-4142-9fc5-44d273501240	\N	\N	\N
68	\N	\N	anon-e5cf80a4-c2f2-403d-a804-f679ecab57b4@anon.lumilink	\N	anon-e5cf80a4-c2f2-403d-a804-f679ecab57b4	\N	\N	\N
67	\N	\N	anon-2bd4d68b-e09c-4d3c-a124-0a8db4abfe89@anon.lumilink	\N	anon-2bd4d68b-e09c-4d3c-a124-0a8db4abfe89	\N	\N	\N
66	\N	\N	anon-16fbebe4-21f4-4f05-86b7-af68d71b57d1@anon.lumilink	\N	anon-16fbebe4-21f4-4f05-86b7-af68d71b57d1	\N	\N	\N
64	\N	\N	anon-b2d8e6dc-1b39-4411-b5cb-d950cce379ff@anon.lumilink	\N	anon-b2d8e6dc-1b39-4411-b5cb-d950cce379ff	\N	\N	\N
61	\N	\N	anon-53f78a70-2a06-4167-8ed2-d65066e34d7f@anon.lumilink	\N	anon-53f78a70-2a06-4167-8ed2-d65066e34d7f	\N	\N	\N
55	\N	\N	anon-8caf2487-a25e-4b27-af80-f304ac53bc46@anon.lumilink	\N	anon-8caf2487-a25e-4b27-af80-f304ac53bc46	\N	\N	\N
50	An	Đinh	kingauther33@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocJTH_6NsKPf32Ih_VpvT846_lC-_MOPaHtnIGoqVlrnpZV9X_9n=s96-c	kingauther33@gmail.com	\N	\N	\N
46	\N	\N	anon-0ea919d9-17c3-43b5-9b8c-26e5cf5af941@anon.lumilink	\N	anon-0ea919d9-17c3-43b5-9b8c-26e5cf5af941	\N	\N	\N
44	\N	\N	anon-33214a81-391d-4dfe-8dc4-282f2bbd3927@anon.lumilink	\N	anon-33214a81-391d-4dfe-8dc4-282f2bbd3927	\N	\N	\N
41	kent	java	javakent91@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocL1oUmz8Ja-GjzPEoGrMFuIxKl0OuSENoFGaE2V4UmVaeVOxQ=s96-c	javakent91@gmail.com	\N	\N	\N
39	\N	\N	anon-4c6be7be-22ed-4886-9558-48523eaa7372@anon.lumilink	\N	anon-4c6be7be-22ed-4886-9558-48523eaa7372	\N	\N	\N
35	\N	\N	anon-62272b3c-97fb-4555-8af0-5ca1b4e2dff3@anon.lumilink	\N	anon-62272b3c-97fb-4555-8af0-5ca1b4e2dff3	\N	\N	\N
34	\N	\N	anon-6077d4e1-ba36-4b43-99fe-b6afc806c91c@anon.lumilink	\N	anon-6077d4e1-ba36-4b43-99fe-b6afc806c91c	\N	\N	\N
33	\N	\N	anon-0b06148f-962f-4b94-9fb9-287749da0591@anon.lumilink	\N	anon-0b06148f-962f-4b94-9fb9-287749da0591	\N	\N	\N
32	\N	\N	anon-4f4c7727-b18f-498f-9d36-6cd09614211e@anon.lumilink	\N	anon-4f4c7727-b18f-498f-9d36-6cd09614211e	\N	\N	\N
29	Tam	Nguyen Thi	tamnt@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocLybeWqQgUrXOApXSLi9eDtqmIfIFCHeC89e35q0dJ-5lwNgZ0=s96-c	tamnt@savameta.com	2026-05-26T07:45:33.274Z	2026-03-15 17:55:03.074+00	2026-05-26 08:07:03.45+00
179	Bảo	Nguyễn Quốc	quocbaonguyen1901@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocLAdtcUqAuqsR9KSvb8XYgfqIX-qDnp3haeL9UJl3Qy-cIUQeM=s96-c	quocbaonguyen1901@gmail.com	2026-05-26T07:45:36.040Z	2026-05-18 06:54:47.669+00	2026-05-26 04:32:09.755+00
181			anon-64b29deb-7791-49c6-acde-c430644b43ba@anon.lumilink	\N	anon-64b29deb-7791-49c6-acde-c430644b43ba	2026-05-26T07:45:33.309Z	2026-05-21 06:13:46.82+00	2026-05-21 06:13:46.82+00
83			anon-ee32c33c-602c-4d52-a91c-916de38c1289@anon.lumilink	\N	anon-ee32c33c-602c-4d52-a91c-916de38c1289	2026-05-26T07:45:33.250Z	2026-03-16 00:43:20.705+00	2026-03-16 08:00:08.127+00
63	\N	\N	anon-240c9cc1-fde2-4abd-b288-5f13e76be75c@anon.lumilink	\N	anon-240c9cc1-fde2-4abd-b288-5f13e76be75c	\N	2026-04-03 13:09:25.225+00	2026-04-03 13:09:25.225+00
54	An	Đinh	anon-69b65d4a-2670-42c0-9a7e-73382ff390a8@anon.lumilink	https://lh3.googleusercontent.com/a/ACg8ocJTH_6NsKPf32Ih_VpvT846_lC-_MOPaHtnIGoqVlrnpZV9X_9n=s96-c	anon-69b65d4a-2670-42c0-9a7e-73382ff390a8	2026-05-26T07:45:35.062Z	2026-05-23 11:48:21.664+00	2026-05-23 12:04:17.959+00
162			anon-412978c5-dd77-4407-9e03-8083cd238784@anon.lumilink	\N	anon-412978c5-dd77-4407-9e03-8083cd238784	2026-05-26T07:45:33.319Z	2026-04-30 08:34:32.749+00	2026-04-30 08:34:32.749+00
52	\N	\N	anon-8425c880-3081-496d-acc5-2ef1fb7634b7@anon.lumilink	\N	anon-8425c880-3081-496d-acc5-2ef1fb7634b7	\N	2026-03-31 13:43:23.231+00	2026-03-31 13:43:23.231+00
51			anon-6aa0eb02-6137-4b95-9a0c-0fe190da7a6c@anon.lumilink	\N	anon-6aa0eb02-6137-4b95-9a0c-0fe190da7a6c	2026-05-26T07:45:34.923Z	2026-03-19 02:41:20.129+00	2026-05-26 06:08:21.249+00
30	Ngọc Minh	Trần	mailcongviec010011@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocISsHrL0WQw-yz21SjMs0_uKWRgzWYdp_a1OAeQmfQHGdFuOw=s96-c	mailcongviec010011@gmail.com	\N	\N	\N
27	\N	\N	anon-b40e0b67-ab06-4b39-832d-f783370f5140@anon.lumilink	\N	anon-b40e0b67-ab06-4b39-832d-f783370f5140	\N	\N	\N
22	\N	\N	anon-3fb8e888-05d3-493f-b7d6-257553be8b92@anon.lumilink	\N	anon-3fb8e888-05d3-493f-b7d6-257553be8b92	\N	\N	\N
19	\N	\N	anon-2d9e1429-4830-4a29-89a7-5fcded2b14dc@anon.lumilink	\N	anon-2d9e1429-4830-4a29-89a7-5fcded2b14dc	\N	\N	\N
16	\N	\N	anon-cdfb4dcc-010b-4c6b-81d0-0ba1fa6cde67@anon.lumilink	\N	anon-cdfb4dcc-010b-4c6b-81d0-0ba1fa6cde67	\N	\N	\N
14	Thieu	Nguyen	thieunguyen1712@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocIEVsC-A_2sBGdu0MYxWj6-hLcca1OKKhhuVIn8gT8rHN8HTqg=s96-c	thieunguyen1712@gmail.com	\N	\N	\N
13	\N	\N	anon-ff7a41a1-ceda-4424-bd3f-f4e5c7ee5579@anon.lumilink	\N	anon-ff7a41a1-ceda-4424-bd3f-f4e5c7ee5579	\N	\N	\N
12	\N	\N	anon-58da87ec-c5c0-4889-baf9-9db67f25acb9@anon.lumilink	\N	anon-58da87ec-c5c0-4889-baf9-9db67f25acb9	\N	\N	\N
11	\N	\N	anon-f6611316-8747-4678-b309-bf6f9acf7a8f@anon.lumilink	\N	anon-f6611316-8747-4678-b309-bf6f9acf7a8f	\N	\N	\N
10	\N	\N	anon-f477c314-a768-4f83-bb04-6d4184bcca17@anon.lumilink	\N	anon-f477c314-a768-4f83-bb04-6d4184bcca17	\N	\N	\N
7	\N	\N	anon-f28e1827-d658-4566-b9c4-f123226f3237@anon.lumilink	\N	anon-f28e1827-d658-4566-b9c4-f123226f3237	\N	\N	\N
5	\N	\N	anon-9ee48636-85c4-496a-b31b-a6727c1f46e1@anon.lumilink	\N	anon-9ee48636-85c4-496a-b31b-a6727c1f46e1	\N	\N	\N
4	System	Admin	adminlumi@gmail.com	\N	adminlumi	\N	\N	\N
170			anon-c30ad847-2ae8-4e11-a1c4-3e3f3aa824a6@anon.lumilink	\N	anon-c30ad847-2ae8-4e11-a1c4-3e3f3aa824a6	2026-05-26T07:45:34.964Z	2026-05-06 05:53:06.716+00	2026-05-06 05:53:06.716+00
168			anon-c9fbe69d-ac1b-42ca-a2a7-a2b49ce98960@anon.lumilink	\N	anon-c9fbe69d-ac1b-42ca-a2a7-a2b49ce98960	2026-05-26T07:45:33.271Z	2026-05-06 03:48:42.959+00	2026-05-06 03:48:42.959+00
115	\N	\N	anon-186bec9d-152a-49c8-a961-8c0d25d65e5a@anon.lumilink	\N	anon-186bec9d-152a-49c8-a961-8c0d25d65e5a	\N	2026-05-13 09:25:13.222+00	2026-05-13 09:25:13.222+00
114			anon-d2c6d80b-a27a-45e1-8591-c8398c833fe3@anon.lumilink	\N	anon-d2c6d80b-a27a-45e1-8591-c8398c833fe3	2026-05-26T07:45:35.266Z	2026-03-19 15:04:36.421+00	2026-03-19 15:05:13.531+00
107			anon-e4b89627-64a9-471a-97bb-be24b16e9046@anon.lumilink	\N	anon-e4b89627-64a9-471a-97bb-be24b16e9046	2026-05-26T07:45:33.271Z	2026-03-19 04:00:48.808+00	2026-03-19 04:00:48.808+00
105			anon-5ac50cb1-bc4d-40ab-ab13-eef784d77fd6@anon.lumilink	\N	anon-5ac50cb1-bc4d-40ab-ab13-eef784d77fd6	2026-05-26T07:45:33.270Z	2026-03-19 02:40:10.438+00	2026-03-19 02:40:22.361+00
101			anon-2d51437d-0a5e-4a2f-8374-5b5ea6eca7b1@anon.lumilink	\N	anon-2d51437d-0a5e-4a2f-8374-5b5ea6eca7b1	2026-05-26T07:45:34.798Z	2026-03-18 08:05:46.301+00	2026-03-18 08:09:54.461+00
93	\N	\N	anon-98930c10-3789-402d-b63f-f2c518f8d7b1@anon.lumilink	\N	anon-98930c10-3789-402d-b63f-f2c518f8d7b1	\N	2026-04-28 08:03:15.248+00	2026-04-28 08:08:46.711+00
92			anon-09844515-a342-4a4e-be8b-ad671bd00340@anon.lumilink	\N	anon-09844515-a342-4a4e-be8b-ad671bd00340	2026-05-26T07:45:35.160Z	2026-03-16 13:23:53.486+00	2026-03-16 13:24:28.168+00
89	Hiểu	Linh	trandieulinh2512@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocJQnbxH19chsOiIaAEqnZN4QQKtJeMelPSbWvJ9T4J3iOKcK7dL=s96-c	trandieulinh2512@gmail.com	2026-05-26T07:45:33.277Z	2026-03-16 08:24:12.418+00	2026-04-21 15:02:19.943+00
80			anon-6398b587-b725-49d8-a698-80c54a31bdb4@anon.lumilink	\N	anon-6398b587-b725-49d8-a698-80c54a31bdb4	2026-05-26T07:45:35.243Z	2026-03-15 07:54:34.553+00	2026-03-15 07:54:34.553+00
60	Linh	Pham Thuy	linhpt@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocIJCyp-mS6gaiKPlF-9yVKnLorDziSgy4Pl_B3EFhYIZkh60g=s96-c	linhpt@savameta.com	\N	2026-04-02 08:45:12.07+00	2026-04-06 02:05:33.481+00
45	Diệu Linh	Trần	linhtd@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocJ49Lyps65L9JObgYi1ijg3qbCft5ZqJHKdo0TBwNl4vSDOhg=s96-c	linhtd@savameta.com	\N	2026-04-01 06:49:07.328+00	2026-05-12 07:42:05.14+00
36	Ban	Nguyen Duc	bannd@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocK1Aroxh3QEY9FQ-E3idLLmLhnKSzXB3el8AGF8V3-YtHKFZw=s96-c	bannd@savameta.com	2026-05-26T07:45:36.034Z	2026-03-06 09:45:34.997+00	2026-03-23 09:35:39.605+00
31	AI	Blockchain	blockchain-ai@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocJNv5ZEjhU3sZ4ibazM_t0B4ah-I3U5ToHQl7IsGdABBHj4gA=s96-c	blockchain-ai@savameta.com	2026-05-26T07:45:34.959Z	2026-05-22 02:40:52.029+00	2026-05-26 09:19:11.251+00
6			anon-dd49503e-0105-4c00-a4d0-222476856887@anon.lumilink	\N	anon-dd49503e-0105-4c00-a4d0-222476856887	2026-05-26T07:45:35.192Z	2026-03-03 02:58:03.519+00	2026-03-23 03:33:13.634+00
163			anon-09f54dac-01dd-4d48-a36d-f92e74691766@anon.lumilink	\N	anon-09f54dac-01dd-4d48-a36d-f92e74691766	2026-05-26T07:45:34.924Z	2026-05-03 02:01:24.351+00	2026-05-03 02:01:24.351+00
125	Dev	User	dev@lumilink.local	\N	dev	2026-05-26T07:45:35.717Z	2026-03-23 03:22:03.725+00	2026-03-23 03:22:03.725+00
158			anon-3089c61d-b67c-4956-aea5-1a2be59c20bf@anon.lumilink	\N	anon-3089c61d-b67c-4956-aea5-1a2be59c20bf	2026-05-26T07:45:35.276Z	2026-04-20 06:20:23.005+00	2026-04-20 06:20:23.005+00
156			anon-7bf44728-ed58-4dcd-9d58-234aa3303082@anon.lumilink	\N	anon-7bf44728-ed58-4dcd-9d58-234aa3303082	2026-05-26T07:45:34.798Z	2026-04-14 03:37:09.452+00	2026-04-14 03:37:09.452+00
133	Hoàng	Phan	phanhoang.haluva@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocKv25lEaAj6L_gO_ns4EoB2KTsKte4GjnqZ8iQQ2e3ax-7LeUFv=s96-c	phanhoang.haluva@gmail.com	2026-05-26T07:45:33.284Z	2026-03-23 11:07:56.316+00	2026-03-23 11:17:53.377+00
127			anon-5b6b2b2d-8843-4486-9013-d3529298802e@anon.lumilink	\N	anon-5b6b2b2d-8843-4486-9013-d3529298802e	2026-05-26T07:45:34.923Z	2026-03-23 03:36:57.208+00	2026-03-23 03:37:50.522+00
166			anon-03dc17cd-1dee-4d47-8332-1e667e655de6@anon.lumilink	\N	anon-03dc17cd-1dee-4d47-8332-1e667e655de6	2026-05-26T07:45:34.817Z	2026-05-05 02:56:47.902+00	2026-05-05 02:58:09.065+00
161			anon-58191063-26a8-4cd4-9caf-23364cb41163@anon.lumilink	\N	anon-58191063-26a8-4cd4-9caf-23364cb41163	2026-05-26T07:45:33.297Z	2026-04-25 08:58:02.712+00	2026-04-25 08:58:02.712+00
157			anon-ecffeb15-f19e-4f15-b911-507cde74f57e@anon.lumilink	\N	anon-ecffeb15-f19e-4f15-b911-507cde74f57e	2026-05-26T07:45:33.309Z	2026-04-14 08:29:48.052+00	2026-04-14 08:36:38.699+00
183	Dai	Le Quang	dailq@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocKu382NpXfGCjAj3KffSry5Q1fkBA0XRWMRD_v_aACbZopgbA=s96-c	dailq@savameta.com	2026-05-26T07:45:33.220Z	2026-05-22 06:31:47.178+00	2026-05-22 08:22:30.56+00
136	\N	\N	\N	\N	\N	\N	2026-03-23 11:50:49.296+00	2026-03-23 11:54:33.505+00
124	\N	\N	anon-0104219a-e3eb-4ace-a3c8-56216454c7b9@anon.lumilink	\N	anon-0104219a-e3eb-4ace-a3c8-56216454c7b9	\N	2026-05-25 14:56:24.349+00	2026-05-25 14:57:46.684+00
123	\N	\N	anon-95f9de0d-8b99-451a-a73a-65702da79abb@anon.lumilink	\N	anon-95f9de0d-8b99-451a-a73a-65702da79abb	\N	2026-05-22 13:08:38.15+00	2026-05-22 13:35:52.938+00
121	Long	Tran Tuan	longtt@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocI_WBOkHhLTzZIeY-g6VJMAlCbhpt7iMM-UgEdc1WRLHobOCw=s96-c	longtt@savameta.com	2026-05-26T07:45:35.202Z	2026-03-22 10:47:30.22+00	2026-05-19 09:56:40.754+00
120	\N	\N	anon-bf79755e-f8bb-411d-bcd9-95b1527d52dd@anon.lumilink	\N	anon-bf79755e-f8bb-411d-bcd9-95b1527d52dd	\N	2026-05-19 08:46:15.014+00	2026-05-19 08:46:15.014+00
119	\N	\N	anon-00da1b7b-f0cf-499a-8462-dd3b9d3a0ea3@anon.lumilink	\N	anon-00da1b7b-f0cf-499a-8462-dd3b9d3a0ea3	\N	2026-05-19 05:22:26.377+00	2026-05-19 05:22:26.377+00
118			anon-95e267a0-2b9e-42f9-9795-1629e2f9d3a6@anon.lumilink	\N	anon-95e267a0-2b9e-42f9-9795-1629e2f9d3a6	2026-05-26T07:45:33.220Z	2026-03-20 08:28:55.331+00	2026-05-19 03:17:47.124+00
109	\N	\N	anon-b34ed20f-accf-4206-b4e2-6e84242881e1@anon.lumilink	\N	anon-b34ed20f-accf-4206-b4e2-6e84242881e1	\N	2026-05-09 14:55:26.749+00	2026-05-09 14:55:26.749+00
102	Hưng	Ninh Văn	hoaphongba59@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocJuCk8HYdpZoNS8BodFw6Kq2bcmJrHvDUCyns7uZdCqxsUDYjE=s96-c	hoaphongba59@gmail.com	2026-05-26T07:45:36.238Z	2026-03-18 08:12:54.595+00	2026-05-20 11:43:36.337+00
99	Khoi	Tran Trong	khoitt@savameta.com	https://lumilink-s3.defikit.net/file-99-avatar-99-1778667300792-q3xvj0Q5xlezO7Tt-{Screenshot_2026-05-12_115435.png}	khoitt@savameta.com	\N	2026-05-04 09:33:12.422+00	2026-05-13 10:22:11.258+00
98			anon-44a0dac6-04c2-4a9d-ac5c-6b5ac02bb87e@anon.lumilink	\N	anon-44a0dac6-04c2-4a9d-ac5c-6b5ac02bb87e	2026-05-26T07:45:35.933Z	2026-03-18 07:21:36.358+00	2026-03-18 07:21:36.358+00
88			anon-aad524a5-2838-4a61-bbd2-9e7443717b2d@anon.lumilink	\N	anon-aad524a5-2838-4a61-bbd2-9e7443717b2d	2026-05-26T07:45:33.298Z	2026-03-16 07:34:52.963+00	2026-03-16 07:34:52.963+00
85			anon-120ee02b-01f2-4cb0-8e93-162a59875466@anon.lumilink	\N	anon-120ee02b-01f2-4cb0-8e93-162a59875466	2026-05-26T07:45:35.276Z	2026-03-16 00:52:47.617+00	2026-04-14 06:59:14.25+00
79			anon-3fb456d7-f807-4301-85a2-9b28b7b6cb49@anon.lumilink	\N	anon-3fb456d7-f807-4301-85a2-9b28b7b6cb49	2026-05-26T07:45:34.944Z	2026-03-15 07:43:55.511+00	2026-03-15 07:44:55.8+00
75	\N	\N	anon-7f6a6a58-dabe-4a27-b850-829429bff785@anon.lumilink	\N	anon-7f6a6a58-dabe-4a27-b850-829429bff785	\N	2026-04-09 09:44:44.632+00	2026-04-09 09:44:44.632+00
65	\N	\N	anon-eb0a88cc-2bf1-4298-88bd-ee4f83afde3c@anon.lumilink	\N	anon-eb0a88cc-2bf1-4298-88bd-ee4f83afde3c	\N	2026-04-04 08:04:46.511+00	2026-04-04 08:04:46.511+00
62	Phạm	Linh	anon-41d513a5-1318-4ffe-a672-df0faf5f9c96@anon.lumilink	https://lh3.googleusercontent.com/a/ACg8ocJYKdV8sLuXYEymlZw4T-F-aS_GOmpQegmCKGwxjT40jowYtg=s96-c	anon-41d513a5-1318-4ffe-a672-df0faf5f9c96	2026-05-26T07:45:36.791Z	2026-03-23 08:13:00.491+00	2026-03-23 09:00:10.176+00
59	\N	\N	anon-e872836b-4ba8-4b6d-a667-45982b14d6d5@anon.lumilink	\N	anon-e872836b-4ba8-4b6d-a667-45982b14d6d5	\N	2026-04-02 04:30:37.637+00	2026-04-02 04:30:37.637+00
53	Thieu	Nguyen	anon-e3a8d637-282e-41ee-a0c3-f79eba35bbcc@anon.lumilink	https://lh3.googleusercontent.com/a/ACg8ocIEVsC-A_2sBGdu0MYxWj6-hLcca1OKKhhuVIn8gT8rHN8HTqg=s96-c	anon-e3a8d637-282e-41ee-a0c3-f79eba35bbcc	2026-05-26T07:45:33.277Z	2026-03-18 07:24:30.697+00	2026-03-18 10:15:12.31+00
48	Trọng	Trần Bình	binhtrong0504@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocKLtKOF3uA8UZXOLTLAKm96JIPudrFS4AVKMBLs29VyyoyuYnym=s96-c	binhtrong0504@gmail.com	2026-05-26T07:45:33.240Z	2026-03-23 03:55:23.628+00	2026-04-05 15:29:57.229+00
43	Hung	Ninh Van	hungnv@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocK-Luu0Ls1vE2XCVCDLC5tENgb653_3P7QEtj255FsS5tTOHw=s96-c	hungnv@savameta.com	2026-05-26T07:45:33.282Z	2026-03-06 08:05:00.416+00	2026-05-25 10:25:25.454+00
42	Khoi	Tran Trong	anon-de382d7b-fb0f-4a9a-94c9-184c398e2693@anon.lumilink	https://lumilink-s3-staging.defikit.net/file-42-avatar-42-1779444737681-vTMmrviRqu958r7O-{avtFace.jpeg}	anon-de382d7b-fb0f-4a9a-94c9-184c398e2693	2026-05-26T07:45:35.149Z	2026-03-05 09:17:05.887+00	2026-05-26 06:48:45.798+00
40	Mạnh Thường	Đỗ	anon-dcc623b3-b1f1-4248-8095-ac32a941053f@anon.lumilink	https://lh3.googleusercontent.com/a/ACg8ocL5rYmvIbYPDOtJ7pPSVWlWF6Wy653ttbLku2Vvp1fYsXyz99s=s96-c	anon-dcc623b3-b1f1-4248-8095-ac32a941053f	2026-05-26T07:45:36.792Z	2026-05-05 08:17:17.524+00	2026-05-05 08:17:17.524+00
38	Giang	Vu Tran Minh	anon-93ab1095-23e8-49db-a0d9-ea83a5fa06f0@anon.lumilink	https://lh3.googleusercontent.com/a/ACg8ocKliBEsFnaJ3pkQFqACSh4KtDheDqJ60Jpvn-8QfT0aXq5gZg=s96-c	anon-93ab1095-23e8-49db-a0d9-ea83a5fa06f0	2026-05-26T07:45:33.247Z	2026-04-09 08:58:30.248+00	2026-04-09 09:00:54.744+00
26	Nam	Duong Hong	anon-6515e87c-12b0-4583-9c19-367233dc60af@anon.lumilink	https://lh3.googleusercontent.com/a/ACg8ocKUhiRLD6XanHG0Dk4hKNlKN8XzfYJuYobzKjlh-NH3r2aFXA=s96-c	anon-6515e87c-12b0-4583-9c19-367233dc60af	2026-05-26T07:45:33.230Z	2026-05-06 03:49:37.842+00	2026-05-26 08:57:40.887+00
15	An	Dinh Tien	andt@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocIwqokWIKP0s2vVF5jPPE7SlJROwHUlgj9riiqwN6jdW5zlEg=s96-c	andt@savameta.com	2026-05-26T07:45:35.837Z	2026-03-23 03:49:13.949+00	2026-05-25 08:42:46.439+00
9	Thieu	Nguyen Van	thieunv@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocJDqNPQ52NphZkS1433j-GQ1D4nHTtq4vyQbSb27b92xyt8TQ=s96-c	thieunv@savameta.com	\N	2026-03-31 02:00:12.471+00	2026-05-12 01:59:37.448+00
2			anon-d7c6e07e-3704-43e4-9087-97ff79360f60@anon.lumilink	\N	anon-d7c6e07e-3704-43e4-9087-97ff79360f60	2026-05-26T07:45:36.184Z	2026-04-29 05:18:32.663+00	2026-05-26 09:40:37.34+00
160	Agent	AI	aiagentdev2@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocIRJ5H4YUpoUhF5YLZb8rbA5lrxGEyd51RGhD-rUY4c-yJXFA=s96-c	aiagentdev2@savameta.com	2026-05-26T07:45:36.109Z	2026-04-21 10:49:38.51+00	2026-04-21 10:54:49.404+00
154			anon-fd757e2f-069b-4d1e-9a9f-ac04a8d252e8@anon.lumilink	\N	anon-fd757e2f-069b-4d1e-9a9f-ac04a8d252e8	2026-05-26T07:45:34.821Z	2026-04-10 07:13:45.654+00	2026-04-10 07:22:40.365+00
131	Cheshire		92c.things@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocIQaVQIOEPZsz6BJqExdhfYurQHJJ_UTmCXAO8zdqJpx3yeKw=s96-c	92c.things@gmail.com	2026-05-26T07:45:35.753Z	2026-03-23 10:07:44.66+00	2026-03-23 11:53:21.036+00
177			anon-e5569b0f-6369-4014-93ce-68e9a2bddb9e@anon.lumilink	\N	anon-e5569b0f-6369-4014-93ce-68e9a2bddb9e	2026-05-26T07:45:36.801Z	2026-05-13 10:12:42.65+00	2026-05-13 10:12:42.65+00
182			anon-da387aaa-63ad-4b00-b569-10ceb277ed7f@anon.lumilink	\N	anon-da387aaa-63ad-4b00-b569-10ceb277ed7f	2026-05-26T07:45:33.330Z	2026-05-22 05:37:50.075+00	2026-05-22 05:37:50.075+00
171			anon-ffef39dc-bfb8-432e-84f8-61dee9384386@anon.lumilink	\N	anon-ffef39dc-bfb8-432e-84f8-61dee9384386	2026-05-26T07:45:34.963Z	2026-05-12 02:32:31.305+00	2026-05-12 02:32:31.305+00
130			anon-fbbe32a1-02ab-4ac7-a405-b731ee0b7655@anon.lumilink	\N	anon-fbbe32a1-02ab-4ac7-a405-b731ee0b7655	2026-05-26T07:45:34.697Z	2026-03-23 04:21:17.172+00	2026-03-23 04:21:17.172+00
165			anon-66c0ca0c-50c3-4bf3-b994-72335dc2fa48@anon.lumilink	\N	anon-66c0ca0c-50c3-4bf3-b994-72335dc2fa48	2026-05-26T07:45:35.019Z	2026-05-04 05:57:09.384+00	2026-05-04 05:57:09.384+00
122	\N	\N	anon-3fe4cdc1-8e91-450a-90b3-b619c3dc9b12@anon.lumilink	\N	anon-3fe4cdc1-8e91-450a-90b3-b619c3dc9b12	\N	2026-05-19 09:57:30.557+00	2026-05-19 09:57:30.557+00
106	\N	\N	anon-75e32ea2-0c73-4b14-80dc-ff37e4be2c7f@anon.lumilink	\N	anon-75e32ea2-0c73-4b14-80dc-ff37e4be2c7f	\N	2026-05-08 07:11:18.366+00	2026-05-08 07:11:18.366+00
95			anon-07d9c9de-87dc-4fe4-baa2-8ad021acffb2@anon.lumilink	\N	anon-07d9c9de-87dc-4fe4-baa2-8ad021acffb2	2026-05-26T07:45:35.051Z	2026-03-17 09:26:48.321+00	2026-03-18 08:01:47.892+00
94			anon-ce4941bb-7b70-4884-a1f9-28397da19e1f@anon.lumilink	\N	anon-ce4941bb-7b70-4884-a1f9-28397da19e1f	2026-05-26T07:45:34.817Z	2026-03-18 08:05:03.47+00	2026-03-18 08:05:03.47+00
91			anon-3bb42062-f4c5-4d2d-9e38-3d025befd033@anon.lumilink	\N	anon-3bb42062-f4c5-4d2d-9e38-3d025befd033	2026-05-26T07:45:33.275Z	2026-03-16 08:56:51.09+00	2026-04-24 07:46:51.537+00
58	tran	khoi	khoitay11566@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocJusvUEdNN0oprRogfJ2m9SplLfDFiKpqVefwfcbjdSmVJqaLoi=s96-c	khoitay11566@gmail.com	\N	2026-04-02 02:10:09.157+00	2026-05-19 05:33:58.344+00
57	Kien	Nguyen Van	anon-ff970884-7fa1-4383-9c1b-5aa999f15a15@anon.lumilink	https://lh3.googleusercontent.com/a/ACg8ocKsy_gO2Vd8rQ345Xg2NmwlivRZ86qgwtZwRLHFYYQmEzpeTiY=s96-c	anon-ff970884-7fa1-4383-9c1b-5aa999f15a15	2026-05-26T07:45:33.246Z	2026-03-03 03:03:20.941+00	2026-05-26 08:17:33.542+00
56	Trong	Tran Binh	trongtb@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocKn-Cv6koLQx7XP6XnT16w8rSmXUorc4RGks8bttBFU8lMWeQ=s96-c	trongtb@savameta.com	\N	2026-04-01 10:59:47.506+00	2026-04-01 11:02:37.773+00
49			anon-190d2b03-fbea-47f1-892e-88054141dd13@anon.lumilink	https://lumilink-s3-staging.defikit.net/file-49-avatar-49-1779045036924-tT1Urv5D2D1PnUMb-{FB_IMG_1743086015918.jpg}	anon-190d2b03-fbea-47f1-892e-88054141dd13	2026-05-26T07:45:35.062Z	2026-03-03 10:54:12.007+00	2026-05-12 02:50:09.998+00
47	Linh	Nguyen Hoai	linhnh@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocLbvI4HcXjhF-3WJNM3VFz_nFBPuZ7tGfJSjVfhiqWEig1jDdzM=s96-c	linhnh@savameta.com	2026-05-26T07:45:34.954Z	2026-03-03 10:27:20.187+00	2026-05-26 03:41:34.331+00
37	Tâm	Đàm Thị Thanh	tamdtt@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocIboISn2ReivBcERgwkCSexiYZLKB4aOs-KYeNf2_yLXWexfg=s96-c	tamdtt@savameta.com	\N	2026-05-04 11:13:06.338+00	2026-05-04 11:13:06.338+00
28	Aiagent	Dev	anon-091d5839-c84f-4a3a-b00a-e5a8616dc096@anon.lumilink	https://lh3.googleusercontent.com/a/ACg8ocKA-DheBoc415t0qzVDClmenF_gUjh98MPDCKcqBbpr_PDE7g=s96-c	anon-091d5839-c84f-4a3a-b00a-e5a8616dc096	2026-05-26T07:45:35.834Z	2026-04-07 08:33:21.458+00	2026-04-21 09:21:54.592+00
25	Hồng Nam	Dương	anon-2b59c680-126f-4d3c-ac76-a3538fc0615a@anon.lumilink	https://lh3.googleusercontent.com/a/ACg8ocI_udxOr79AYszTBeUEb8h1QZHaxKtS_bFrWgjmFbWSVJx-9SPE=s96-c	anon-2b59c680-126f-4d3c-ac76-a3538fc0615a	2026-05-26T07:45:33.203Z	2026-03-16 05:51:24.453+00	2026-05-26 03:03:36.486+00
24	Linh	Pham Thuy	anon-b92c3373-ea66-4660-b347-6ff169f5e22f@anon.lumilink	https://lh3.googleusercontent.com/a/ACg8ocIJCyp-mS6gaiKPlF-9yVKnLorDziSgy4Pl_B3EFhYIZkh60g=s96-c	anon-b92c3373-ea66-4660-b347-6ff169f5e22f	2026-05-26T07:45:33.175Z	2026-05-13 09:20:03.143+00	2026-05-26 09:07:48.928+00
23	Kien	Nguyen Van	kiennv@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocKsy_gO2Vd8rQ345Xg2NmwlivRZ86qgwtZwRLHFYYQmEzpeTiY=s96-c	kiennv@savameta.com	\N	2026-04-04 03:01:35.799+00	2026-05-14 01:38:32.365+00
21			anon-8a087ebc-9f41-49e9-b34b-1c06908f7ac6@anon.lumilink	\N	anon-8a087ebc-9f41-49e9-b34b-1c06908f7ac6	2026-05-26T07:45:35.051Z	2026-03-03 02:15:21.302+00	2026-05-26 10:51:31.313+00
20			anon-69a1b9b5-82d4-4edb-911f-57cb8fb45463@anon.lumilink	\N	anon-69a1b9b5-82d4-4edb-911f-57cb8fb45463	2026-05-26T07:45:33.053Z	2026-03-18 01:40:06.869+00	2026-05-26 04:36:53.357+00
18	Tammy	Nguyen	tammynguyen09.job@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocIDscBESyGmURTKqQfZ-8OGcrn_Sq3QuVWxPD2V8IUjR99BRw=s96-c	tammynguyen09.job@gmail.com	\N	2026-04-02 00:34:17.9+00	2026-04-02 00:39:32.44+00
17	Nam	Duong Hong	namdh@savameta.com	https://lh3.googleusercontent.com/a/ACg8ocKUhiRLD6XanHG0Dk4hKNlKN8XzfYJuYobzKjlh-NH3r2aFXA=s96-c	namdh@savameta.com	\N	2026-04-02 10:37:49.252+00	2026-05-15 08:45:26.676+00
8			anon-ba20524e-650e-4754-8a29-387708b2c3b9@anon.lumilink	\N	anon-ba20524e-650e-4754-8a29-387708b2c3b9	2026-05-26T07:45:36.317Z	2026-03-03 02:48:36.384+00	2026-05-25 10:18:59.584+00
3	kiennv		kiennv.contact@gmail.com	https://lh3.googleusercontent.com/a/ACg8ocLryA_tfw27ylgQOta7wrxb5S9PTMKURhHHAhy_twHV3tny6eo=s96-c	kiennv.contact@gmail.com	2026-05-26T07:45:33.239Z	2026-03-03 02:03:40.517+00	2026-05-12 03:55:31.795+00
1			anon-1afda42e-9e2a-47a0-ad1c-f45f300ea907@anon.lumilink	\N	anon-1afda42e-9e2a-47a0-ad1c-f45f300ea907	2026-05-26T07:45:33.303Z	2026-05-25 08:37:22.026+00	2026-05-25 08:40:01.907+00
\.


--
-- Name: releases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.releases_id_seq', 1744, true);


--
-- Name: employee_roster employee_roster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employee_roster
    ADD CONSTRAINT employee_roster_pkey PRIMARY KEY (email);


--
-- Name: history_entries history_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.history_entries
    ADD CONSTRAINT history_entries_pkey PRIMARY KEY (id);


--
-- Name: releases releases_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_name_key UNIQUE (name);


--
-- Name: releases releases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_pkey PRIMARY KEY (id);


--
-- Name: sync_state sync_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_state
    ADD CONSTRAINT sync_state_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY ("userId");


--
-- Name: idx_history_createdat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_history_createdat ON public.history_entries USING btree ("createdAt");


--
-- Name: idx_history_sessionid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_history_sessionid ON public.history_entries USING btree ("sessionId");


--
-- Name: idx_history_userid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_history_userid ON public.history_entries USING btree ("userId");


--
-- Name: idx_releases_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_releases_start ON public.releases USING btree (start_date);


--
-- Name: idx_roster_email_lower; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_roster_email_lower ON public.employee_roster USING btree (lower(email));


--
-- Name: idx_users_email_lower; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email_lower ON public.users USING btree (lower(email));


--
-- Name: idx_users_first_seen; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_first_seen ON public.users USING btree (first_seen_at);


--
-- Name: idx_users_last_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_last_active ON public.users USING btree (last_active_at);


--
-- PostgreSQL database dump complete
--

\unrestrict 3scctEHiAv0PIhUfdCn8lqGDZNiJT0HZwGKHDkhfQqcjnNVjuOefYHCqLFHlbzM

