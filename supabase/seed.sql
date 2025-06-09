SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

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

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', 'd49f4ce0-fda8-442d-b664-6dc9d1385a37', '{"action":"user_confirmation_requested","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-17 20:49:40.884173+00', ''),
	('00000000-0000-0000-0000-000000000000', '4a8c7379-77d9-4dc5-803f-b95616a79ab4', '{"action":"user_signedup","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"team"}', '2025-05-17 20:50:34.179924+00', ''),
	('00000000-0000-0000-0000-000000000000', '44c6da6a-ebc4-46f6-841b-5b0a2b6567fc', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 20:50:41.775496+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f3ccda9c-bb06-4842-a2f7-9f5ed48d23e6', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-17 21:00:55.451459+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b6ba82c0-0ecc-4171-846b-673c7918bd4e', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 21:03:11.785676+00', ''),
	('00000000-0000-0000-0000-000000000000', '7be341a6-3107-40e8-b366-0b195aa25e7f', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 21:06:48.886064+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dbf901b4-cefb-4865-8ecc-3ca12bcc3297', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-17 21:33:58.191482+00', ''),
	('00000000-0000-0000-0000-000000000000', '20637b47-5125-4392-a0b5-d724272a25f8', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 21:42:20.126106+00', ''),
	('00000000-0000-0000-0000-000000000000', '786ebcbf-dffe-411e-b956-471a1a870804', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 21:44:05.257054+00', ''),
	('00000000-0000-0000-0000-000000000000', '380236f6-d82b-4888-aacb-216b7e3d0af0', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 21:51:18.8361+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a645b560-f004-4d9f-9650-a50184d3a4ab', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 21:54:09.394139+00', ''),
	('00000000-0000-0000-0000-000000000000', '642ba105-317b-4005-9e2d-2ee4ced059d5', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-17 22:12:37.150695+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a7c636e2-284c-4478-b300-16f443b27a4c', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:12:51.601646+00', ''),
	('00000000-0000-0000-0000-000000000000', '5c1c5cec-1c8b-41f5-83dd-5e6f64d3d75b', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:13:08.913812+00', ''),
	('00000000-0000-0000-0000-000000000000', '3d6fdc12-2731-4611-ac1c-8f9588f74895', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:18:36.077215+00', ''),
	('00000000-0000-0000-0000-000000000000', '93f957f0-05dc-43b9-bdc6-495d4a009fb6', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:24:58.496301+00', ''),
	('00000000-0000-0000-0000-000000000000', '771c285d-4c3b-41bc-b122-c35fcbe3bc0e', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:26:46.612957+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bdb089bd-1053-42a7-b2a8-f62d91a3acfb', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:27:26.144231+00', ''),
	('00000000-0000-0000-0000-000000000000', '3c3e798c-d397-48d7-98c9-f3444b6aa871', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:30:01.392831+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a8d03cb7-ad4a-4b7f-8b7f-e228d6ed2150', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:34:07.195712+00', ''),
	('00000000-0000-0000-0000-000000000000', '9223655f-9f7c-4ee2-a0a1-2285f7cf8ee8', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:38:54.210577+00', ''),
	('00000000-0000-0000-0000-000000000000', '2ef20296-ce45-442f-9183-fa82d767520d', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:39:30.221738+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b05fc8fd-0204-455a-a9a4-bc14a2400761', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:40:57.058156+00', ''),
	('00000000-0000-0000-0000-000000000000', '9258366d-f15f-4d98-91ec-0afd7e09083a', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:43:01.428748+00', ''),
	('00000000-0000-0000-0000-000000000000', '1fe57521-50a9-419c-a52e-05a97e26999d', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:47:27.608817+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e9467054-1469-4179-8f47-ac725f9492b3', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:48:41.970487+00', ''),
	('00000000-0000-0000-0000-000000000000', '6af6e8fc-9f6d-443e-a32e-568707d35b95', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:53:41.025025+00', ''),
	('00000000-0000-0000-0000-000000000000', '0f9b91c5-429c-4473-98f1-cb0b5f0fd126', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 22:55:26.415702+00', ''),
	('00000000-0000-0000-0000-000000000000', '3ec2a54c-fb11-4baf-9dd5-588c9dc1111d', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 23:00:13.489658+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f563c236-ae8b-4d11-aecf-376de90df70c', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 23:03:51.855079+00', ''),
	('00000000-0000-0000-0000-000000000000', '93b33991-6a7a-4e30-93e2-318a3e5c37b9', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 23:06:17.91726+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e87077b4-d367-40d2-88ea-82c354d769c2', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 23:26:47.424567+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ac674cd5-0c9a-406c-8a4e-0c18cb6aae17', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 23:29:22.559566+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a1defc20-eff3-4de1-b158-a11af064cc46', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-17 23:51:58.612851+00', ''),
	('00000000-0000-0000-0000-000000000000', '9c1ab01c-e69b-4162-989f-b0d1b2eb2fd1', '{"action":"token_refreshed","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-18 00:36:02.086552+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd7a587fb-ab74-4e7b-99ad-b312698960c3', '{"action":"token_revoked","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-18 00:36:02.087494+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd02d8c85-9491-4f4e-ab15-ef52da48875d', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 00:36:35.97259+00', ''),
	('00000000-0000-0000-0000-000000000000', '6ca65f63-62e5-4114-96e0-66a4bcff1ba6', '{"action":"user_repeated_signup","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-18 00:42:07.577102+00', ''),
	('00000000-0000-0000-0000-000000000000', '17f58fec-f254-4936-bc87-a002adeee5c5', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 00:43:02.553387+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd78276e5-6b04-4bc6-8ff0-45023ee8680f', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 00:43:18.736381+00', ''),
	('00000000-0000-0000-0000-000000000000', '68eeae6e-f6a8-4023-aa6d-7f12cc5be929', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 00:46:27.562153+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd8f3ed8d-c946-4ea2-aa83-6dde562c0dac', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 00:46:58.816627+00', ''),
	('00000000-0000-0000-0000-000000000000', '3109cd20-68f1-4ccb-bf0e-0851588dd939', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 00:47:24.690934+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fd3d7c9b-06ec-42b2-b1d9-cc7dcdc52bc7', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 00:57:19.759831+00', ''),
	('00000000-0000-0000-0000-000000000000', '464cd9fa-d3e2-4621-a5fe-4817a883b8c5', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 01:04:55.337895+00', ''),
	('00000000-0000-0000-0000-000000000000', '6c3ad27f-5675-4a06-b1a7-d483f34cefc3', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 01:05:02.623191+00', ''),
	('00000000-0000-0000-0000-000000000000', '6d028e07-1140-4654-996a-249a23ec890c', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 01:07:55.728523+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eb9a6788-5bdc-489e-8162-8c94d85331c5', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 01:07:59.916231+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e4ebe451-611c-43db-bc45-26db4f5dae9a', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 01:09:33.391879+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd37b85d1-47a6-4bf1-97c5-05c56aef0f46', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 01:09:50.509696+00', ''),
	('00000000-0000-0000-0000-000000000000', '0b9424c0-ea98-4d32-b04c-ee14a9ff5159', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 01:14:01.97079+00', ''),
	('00000000-0000-0000-0000-000000000000', '5b047e48-e099-4ae5-99f4-f23ec267ad23', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 01:15:26.807289+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fdd2766f-5142-4e36-ac35-8d780125e827', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 01:19:33.357557+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd4461a2-0169-475e-af28-af2cc0de66f6', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 01:21:57.940555+00', ''),
	('00000000-0000-0000-0000-000000000000', '48dee94a-a3a3-44d9-83af-4f27beb7b831', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 01:24:40.937637+00', ''),
	('00000000-0000-0000-0000-000000000000', '256c1064-e47e-4e7e-b02f-f7826b3a2dd1', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 01:24:44.90501+00', ''),
	('00000000-0000-0000-0000-000000000000', '70a1dc4b-f778-4660-9106-12ea8da4af63', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 01:25:16.897482+00', ''),
	('00000000-0000-0000-0000-000000000000', '4dc6d69f-b41e-4898-a629-a98048773afb', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 01:25:27.182889+00', ''),
	('00000000-0000-0000-0000-000000000000', '0ebfddb9-ec03-4a4e-bdab-f0bd1ae70710', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 01:28:00.520239+00', ''),
	('00000000-0000-0000-0000-000000000000', '250c3d04-c70d-4db2-97bf-35ae0f763dfe', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 01:44:53.973953+00', ''),
	('00000000-0000-0000-0000-000000000000', '75da38fd-1efb-4e3b-8417-a14c95e38b28', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 02:05:02.796324+00', ''),
	('00000000-0000-0000-0000-000000000000', '729745d9-5715-4c68-80c8-597b5ac446f4', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 02:09:17.957128+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bbadf46d-0b55-41d2-bab4-7fb3cc9702c5', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 02:11:04.581273+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c00f075b-b5aa-49ae-b68b-4f65b07c9d96', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 02:11:55.592849+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da37cd91-d2ee-4d7b-ab89-6973981b1eaf', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 02:12:11.159969+00', ''),
	('00000000-0000-0000-0000-000000000000', '148cf74c-7748-47c7-b218-e5bef8ea751d', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 02:12:23.980487+00', ''),
	('00000000-0000-0000-0000-000000000000', '3143b5a3-6bb3-4727-9cfb-119cfa000ce3', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 02:14:15.371155+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b1c7fc77-4db0-42b0-9816-166b8286f30e', '{"action":"token_refreshed","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-18 11:37:19.350659+00', ''),
	('00000000-0000-0000-0000-000000000000', '67237f41-0456-4ba5-a3a4-009587d44adf', '{"action":"token_revoked","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-18 11:37:19.353143+00', ''),
	('00000000-0000-0000-0000-000000000000', '9636efaf-6884-4cd9-bb82-22e1fb883ae9', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 11:37:25.364624+00', ''),
	('00000000-0000-0000-0000-000000000000', '63bf4855-6680-42b8-931e-f6b754eedb88', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 11:37:33.233735+00', ''),
	('00000000-0000-0000-0000-000000000000', '8a1667d8-9262-49cd-a791-56b42157f05b', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 11:37:37.988233+00', ''),
	('00000000-0000-0000-0000-000000000000', '1e2fe826-253c-4709-a926-08a314810e1f', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 11:37:43.419648+00', ''),
	('00000000-0000-0000-0000-000000000000', '73e4ef4b-1f36-4fd4-915d-a0ea0dd486ab', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 11:41:38.315193+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cb6be84f-7ba2-4c11-9346-8e35e52ff9b8', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 11:41:54.040001+00', ''),
	('00000000-0000-0000-0000-000000000000', '27437cc2-f0dd-4a42-8170-59a319056f78', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 11:41:57.394002+00', ''),
	('00000000-0000-0000-0000-000000000000', '19b79f13-7c6b-43f4-8e46-8341f8af6596', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 11:42:05.745681+00', ''),
	('00000000-0000-0000-0000-000000000000', '24fad6e7-f861-41d0-abc3-4617b7d195d5', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 11:42:12.553533+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e04f6b19-fa66-4d18-a67d-9ccd6713f22e', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 11:43:17.406059+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e8a8dcc3-6ec5-41d4-b210-cb88b3bb6a94', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 11:45:27.649127+00', ''),
	('00000000-0000-0000-0000-000000000000', '31adc08e-1fd9-473e-a4ce-ec6e878a5bd8', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 11:45:32.463613+00', ''),
	('00000000-0000-0000-0000-000000000000', '8f4e1533-95b2-429c-92ae-26d66d9dbe65', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 11:45:36.061721+00', ''),
	('00000000-0000-0000-0000-000000000000', '7e1b776e-8877-4e6f-83cb-b47bb50e9649', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 11:45:50.888363+00', ''),
	('00000000-0000-0000-0000-000000000000', '9654da1c-b2ef-46a8-a924-f4297134250f', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 11:45:52.708189+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fd5bf050-0580-44bc-86a9-48bfb0ad0f9f', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 12:35:18.426001+00', ''),
	('00000000-0000-0000-0000-000000000000', '9f93012c-2ae2-4a2b-a20f-bd06f365386e', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 12:35:37.592879+00', ''),
	('00000000-0000-0000-0000-000000000000', '320e4c44-7433-4093-a829-bff4d052bbc7', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 12:35:44.055774+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e3d12765-8cea-4f45-9b4d-9cd8b7c499f5', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 12:35:46.960062+00', ''),
	('00000000-0000-0000-0000-000000000000', '304959c6-4814-4add-b5c5-a4dccba014b1', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 12:35:55.21649+00', ''),
	('00000000-0000-0000-0000-000000000000', '2d353a1b-5c76-49da-a2eb-fea78bdd1802', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 12:36:13.332853+00', ''),
	('00000000-0000-0000-0000-000000000000', '2cee21c2-3ab4-4b43-a91d-ba35c0d4bc0c', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 12:36:21.813558+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e995dbb1-8154-4fb6-9e98-34372a931482', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 12:36:28.231176+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ea85f550-e565-4dd8-afff-3b8fe56c5a07', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 12:37:20.98905+00', ''),
	('00000000-0000-0000-0000-000000000000', '18dca51d-3b72-432d-8d2d-0c32cb053c68', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 12:40:23.03933+00', ''),
	('00000000-0000-0000-0000-000000000000', '834373c4-f1c7-491a-8bae-63aa14a8ecad', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 12:40:25.369158+00', ''),
	('00000000-0000-0000-0000-000000000000', '55764054-a41e-4805-9011-505b0787a94f', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 12:40:43.389376+00', ''),
	('00000000-0000-0000-0000-000000000000', '127d545c-cfef-4492-82fc-5406d20bb258', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 12:40:47.72713+00', ''),
	('00000000-0000-0000-0000-000000000000', '9eb1f3a9-37d3-41db-a98c-21855526f871', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-18 12:51:50.287556+00', ''),
	('00000000-0000-0000-0000-000000000000', '3e16a671-7abb-4a78-8a63-e6a21876f3ff', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-18 12:51:55.158568+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fb308b79-b78f-45e9-abd7-221bb0af784d', '{"action":"token_refreshed","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-18 17:39:37.790662+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cc07940c-e08d-4b28-a6b8-46ef5eb989e0', '{"action":"token_revoked","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-18 17:39:37.799453+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cf10df08-daf1-46c8-9408-ba0c4ed0bf9f', '{"action":"token_refreshed","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-18 19:57:12.179661+00', ''),
	('00000000-0000-0000-0000-000000000000', '680f17b6-430a-4742-9727-cd6c37af4098', '{"action":"token_revoked","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-18 19:57:12.182505+00', ''),
	('00000000-0000-0000-0000-000000000000', '8a6a6320-051b-422a-8e17-86fb41a5fb37', '{"action":"token_refreshed","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-18 22:11:54.442423+00', ''),
	('00000000-0000-0000-0000-000000000000', '94019d36-4f2b-412a-805e-2516063e644a', '{"action":"token_revoked","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-18 22:11:54.444001+00', ''),
	('00000000-0000-0000-0000-000000000000', '133db0ba-25a0-4bad-8c31-c912194589a5', '{"action":"token_refreshed","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-19 14:03:31.311877+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a92a3d08-a443-4f6f-bf52-3e7d89d916b1', '{"action":"token_revoked","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-19 14:03:31.322258+00', ''),
	('00000000-0000-0000-0000-000000000000', '4b4300c8-afc9-4666-8bc1-9bd03da49eb2', '{"action":"token_refreshed","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-19 20:41:09.817506+00', ''),
	('00000000-0000-0000-0000-000000000000', '24a15ed1-6890-431e-b335-5e65a6516d29', '{"action":"token_revoked","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-19 20:41:09.825668+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ecec5d56-2b5d-4aba-ae2e-d79df126681e', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-19 21:35:39.015263+00', ''),
	('00000000-0000-0000-0000-000000000000', '712042d0-e85b-4a98-8a60-cf0623ca575b', '{"action":"user_confirmation_requested","actor_id":"fb016f65-cdc2-444f-aae8-73b26ebdcb5b","actor_name":"Test","actor_username":"mmeow0@mail.ru","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-19 21:36:38.133376+00', ''),
	('00000000-0000-0000-0000-000000000000', '82e48af8-a2e6-498d-b6c3-63be865dafd7', '{"action":"user_confirmation_requested","actor_id":"bc72e9a2-0b67-4fe8-ba65-c18554c83aa2","actor_name":"Mmeow0","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-19 21:37:09.419972+00', ''),
	('00000000-0000-0000-0000-000000000000', '9d994a32-42d7-426d-bf1a-6dd6c3013274', '{"action":"user_signedup","actor_id":"bc72e9a2-0b67-4fe8-ba65-c18554c83aa2","actor_name":"Mmeow0","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"team"}', '2025-05-19 21:37:35.36429+00', ''),
	('00000000-0000-0000-0000-000000000000', '619b4bcd-a888-4b69-810c-8b31c4c15580', '{"action":"login","actor_id":"bc72e9a2-0b67-4fe8-ba65-c18554c83aa2","actor_name":"Mmeow0","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-19 21:37:40.944896+00', ''),
	('00000000-0000-0000-0000-000000000000', '5e9c3a5a-1195-4aef-8608-816de270d055', '{"action":"token_refreshed","actor_id":"bc72e9a2-0b67-4fe8-ba65-c18554c83aa2","actor_name":"Mmeow0","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-20 07:58:21.441439+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c880668a-d8d6-409d-a653-90d5ff2cf765', '{"action":"token_revoked","actor_id":"bc72e9a2-0b67-4fe8-ba65-c18554c83aa2","actor_name":"Mmeow0","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-20 07:58:21.447077+00', ''),
	('00000000-0000-0000-0000-000000000000', '8266620b-4fec-4e81-82c3-ef2b04ae426e', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-22 16:08:22.488876+00', ''),
	('00000000-0000-0000-0000-000000000000', '167a15b9-edd5-40d0-ab7f-25ea5416b7af', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-22 16:09:22.822269+00', ''),
	('00000000-0000-0000-0000-000000000000', '327d2891-be79-4171-b8b8-8d01f44f8082', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-22 16:10:27.278536+00', ''),
	('00000000-0000-0000-0000-000000000000', '4892db92-c1f6-4d84-ac62-d74cc5ba5d3c', '{"action":"login","actor_id":"bc72e9a2-0b67-4fe8-ba65-c18554c83aa2","actor_name":"Mmeow0","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-22 16:11:31.315083+00', ''),
	('00000000-0000-0000-0000-000000000000', '9b8fc91b-474d-4cc7-8289-a624b0a786fd', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-22 16:30:19.273746+00', ''),
	('00000000-0000-0000-0000-000000000000', '4363288d-f6a5-43f2-b3a4-ac4c8756665f', '{"action":"logout","actor_id":"bc72e9a2-0b67-4fe8-ba65-c18554c83aa2","actor_name":"Mmeow0","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-22 16:48:28.867211+00', ''),
	('00000000-0000-0000-0000-000000000000', '879dd0ff-eae6-43df-b46b-700dcbfcb76d', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-22 16:48:35.483051+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a0ef4114-240d-436a-aa7d-297fa7a85c82', '{"action":"login","actor_id":"bc72e9a2-0b67-4fe8-ba65-c18554c83aa2","actor_name":"Mmeow0","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-22 21:56:25.987706+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dfc12345-cc37-415a-9767-fbbd2dc7733d', '{"action":"logout","actor_id":"bc72e9a2-0b67-4fe8-ba65-c18554c83aa2","actor_name":"Mmeow0","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-22 21:57:35.347222+00', ''),
	('00000000-0000-0000-0000-000000000000', '5974f84e-9d20-420e-b0c0-ca593b784636', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-22 21:57:41.774396+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dc01f75a-db8d-4c98-b27d-607c7383648c', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-23 00:34:05.382002+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f9402aca-de92-4f9c-a816-7b0842bf3d06', '{"action":"token_refreshed","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-23 08:55:48.212473+00', ''),
	('00000000-0000-0000-0000-000000000000', '911e6a7f-b08f-4353-9820-e9bec99ec819', '{"action":"token_revoked","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-23 08:55:48.224617+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ed10da40-6548-4781-a52a-79135ff57218', '{"action":"token_refreshed","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-23 10:43:02.249773+00', ''),
	('00000000-0000-0000-0000-000000000000', '3927989f-cc72-41af-957d-b71e2c9b3a3e', '{"action":"token_revoked","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-23 10:43:02.252621+00', ''),
	('00000000-0000-0000-0000-000000000000', '201383a2-01c2-489a-86a5-c77e41c0b0f4', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-23 10:56:34.075662+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a043ed0a-be49-4c2f-92d5-c3281b5d70bc', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-23 10:57:40.603554+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d0c1514-b307-4a2e-9d8e-301ac1920579', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-23 10:57:52.055613+00', ''),
	('00000000-0000-0000-0000-000000000000', '9343809a-174d-4c93-a0d3-c18fa0a4c327', '{"action":"login","actor_id":"bc72e9a2-0b67-4fe8-ba65-c18554c83aa2","actor_name":"Mmeow0","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-23 10:58:20.0238+00', ''),
	('00000000-0000-0000-0000-000000000000', '4a1701ef-5e6a-46f7-b508-ce54a694027a', '{"action":"logout","actor_id":"bc72e9a2-0b67-4fe8-ba65-c18554c83aa2","actor_name":"Mmeow0","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-23 10:58:25.348684+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f9fad632-a9b2-4856-89aa-8f41ae6d1e05', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-23 10:58:28.130406+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd260062-98f3-413f-b2a6-c8764a6bf332', '{"action":"logout","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-23 11:05:24.737573+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd7234dfc-dc4c-49ba-96bf-9bd5379e09dd', '{"action":"login","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-23 11:05:27.638032+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a32d0423-ac97-4154-83fb-90db2d94c81d', '{"action":"user_confirmation_requested","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-23 15:46:35.665699+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da6a75dc-e737-44eb-be40-abe46da0d78a', '{"action":"user_signedup","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"team"}', '2025-05-23 15:47:10.917648+00', ''),
	('00000000-0000-0000-0000-000000000000', 'db0c3391-edf6-4da8-be77-ba3c496138e0', '{"action":"user_repeated_signup","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-23 15:49:48.398826+00', ''),
	('00000000-0000-0000-0000-000000000000', '2e191d3d-e340-4838-b18a-86a845daad14', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"malya_tate@mail.ru","user_id":"bc72e9a2-0b67-4fe8-ba65-c18554c83aa2","user_phone":""}}', '2025-05-23 15:50:57.021415+00', ''),
	('00000000-0000-0000-0000-000000000000', '1183a6b8-3016-47be-a170-184b76b154bc', '{"action":"user_repeated_signup","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-23 15:51:02.41674+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f83f2aa1-2cc4-4119-9195-e81c377a0183', '{"action":"user_confirmation_requested","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-23 15:51:42.749804+00', ''),
	('00000000-0000-0000-0000-000000000000', '87c791c2-4f3e-4255-94be-a4f504f0ca44', '{"action":"user_signedup","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"team"}', '2025-05-23 15:52:30.983397+00', ''),
	('00000000-0000-0000-0000-000000000000', '1c20e424-de03-49dd-96d5-58c4ffc750a2', '{"action":"login","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-23 15:52:38.874617+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ca75f2d2-6b26-4b5a-be22-3e675162ec2f', '{"action":"user_repeated_signup","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-23 15:53:29.735846+00', ''),
	('00000000-0000-0000-0000-000000000000', '1b4cacf1-7fd3-490a-a26f-effc4e0be7d8', '{"action":"login","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-23 15:53:34.089011+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eec67067-d93c-46f7-a37f-c21cbf9a0d80', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-23 18:10:05.100028+00', ''),
	('00000000-0000-0000-0000-000000000000', '6688ce86-1963-413a-bb97-10e66892f9af', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-23 18:10:05.102629+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f106d77f-aadf-4a5c-b2cb-01daf908d103', '{"action":"login","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-23 18:10:21.097503+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b5b910b1-88df-4ab1-86d4-446caf17a46b', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-23 19:08:59.389255+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd337f4a6-1fbb-4fbf-b781-6e3249b982b2', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-23 19:08:59.391809+00', ''),
	('00000000-0000-0000-0000-000000000000', '5ada1848-0332-49d0-9cae-88ca2807eb76', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-23 20:19:59.90888+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f5234ba0-7365-47ff-b50c-716ca27608b2', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-23 20:19:59.911526+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f86f374a-9243-4b64-b5f0-5d5326fd62a5', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-23 20:56:19.325072+00', ''),
	('00000000-0000-0000-0000-000000000000', '962f5a50-8cf9-4ece-a234-1166c8acb5eb', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-23 20:56:19.327617+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bbce0468-4333-4330-a76a-80d0aec46be0', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-25 17:26:06.494978+00', ''),
	('00000000-0000-0000-0000-000000000000', '06ab0ed5-35ca-44a2-86fd-7b9b0cf42ae0', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-25 17:26:06.506904+00', ''),
	('00000000-0000-0000-0000-000000000000', '67f2d3ab-85fa-4320-bc75-4f959f2d707e', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-25 18:46:14.95157+00', ''),
	('00000000-0000-0000-0000-000000000000', '26859d5d-5f2a-43a3-a072-b4503ee45337', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-25 18:46:14.954565+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e1f518ce-5379-4622-bfdc-142294619cf1', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-25 21:14:18.990918+00', ''),
	('00000000-0000-0000-0000-000000000000', '36f8a6d7-a0d5-42bb-a9f5-a986d8a99846', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-25 21:14:18.994244+00', ''),
	('00000000-0000-0000-0000-000000000000', '10b0b98f-d5cf-40c1-a209-7862a7bf52de', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-27 09:40:37.076488+00', ''),
	('00000000-0000-0000-0000-000000000000', '500bbbb4-da6d-4c8c-b9c6-fe91fb50d428', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-27 09:40:37.085587+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a7a88222-0499-4151-81b7-e41678a6256c', '{"action":"login","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-27 09:40:38.143592+00', ''),
	('00000000-0000-0000-0000-000000000000', '796a2638-c0bd-4177-a95a-b001c5d58b99', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-29 23:06:36.924288+00', ''),
	('00000000-0000-0000-0000-000000000000', '80758ac2-481c-4e8d-8d7c-5e7afa8ffe6b', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-29 23:06:36.940765+00', ''),
	('00000000-0000-0000-0000-000000000000', '1750c92e-674d-4c68-ad55-eeb1d12b2f7f', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-30 00:23:26.946404+00', ''),
	('00000000-0000-0000-0000-000000000000', '0bed87ca-f1b5-4c51-81a6-5d20b8b65783', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-30 00:23:26.950941+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b9d5563f-c475-451c-a07c-7522c90c50e0', '{"action":"logout","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-30 00:24:14.154064+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c88c2067-4a0e-40dc-9ce6-20b2fd9518a6', '{"action":"login","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-30 00:24:19.901169+00', ''),
	('00000000-0000-0000-0000-000000000000', '5cce503d-a067-40f5-b5ef-2f0c171f0817', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-30 07:18:55.665578+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f226435d-c897-4560-9d90-4004e22adcdc', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-30 07:18:55.676618+00', ''),
	('00000000-0000-0000-0000-000000000000', '7c51be32-b64a-42ce-becc-56fe9f2a1691', '{"action":"login","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-30 07:18:56.392612+00', ''),
	('00000000-0000-0000-0000-000000000000', '567cbc97-4e3a-4564-ab67-6828a1657017', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-30 08:33:25.709573+00', ''),
	('00000000-0000-0000-0000-000000000000', '9e5804b4-e964-4e9e-807c-85c29ec132c9', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-30 08:33:25.713081+00', ''),
	('00000000-0000-0000-0000-000000000000', '0200f416-5384-431d-988f-a71438a7bfe5', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-30 08:42:56.54842+00', ''),
	('00000000-0000-0000-0000-000000000000', '7c928c08-ab9c-476f-91ab-51eb4f077a4a', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-30 08:42:56.550536+00', ''),
	('00000000-0000-0000-0000-000000000000', '29faa044-92a3-406f-9630-7d7180597694', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-30 14:00:13.314013+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c5658734-870e-43fa-94d2-b19d9a96687f', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-30 14:00:13.319657+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ff8be6d6-f62e-41e5-9768-740134cc8cbd', '{"action":"logout","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-05-30 14:07:01.609132+00', ''),
	('00000000-0000-0000-0000-000000000000', '8f364fc3-60fe-41ad-b215-6780c2069bda', '{"action":"login","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-30 14:07:06.216416+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ccba31bc-ad60-4f9e-911c-99f9d7d09878', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-30 16:42:02.788785+00', ''),
	('00000000-0000-0000-0000-000000000000', '26ca27d4-88cc-497b-848b-b9928abf992e', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-30 16:42:02.792343+00', ''),
	('00000000-0000-0000-0000-000000000000', '10a4c130-3f69-42a0-a5fb-1d98c7eeab8d', '{"action":"login","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-30 17:19:56.487997+00', ''),
	('00000000-0000-0000-0000-000000000000', '613b52c0-0d98-40ec-9156-ebcb1d2895e5', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-30 17:41:37.861078+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eb66baad-e276-4708-9517-ea8b3b9caecf', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-30 17:41:37.863511+00', ''),
	('00000000-0000-0000-0000-000000000000', '3ba07f93-e404-4208-84f6-a2a133345c3a', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-30 19:35:38.381469+00', ''),
	('00000000-0000-0000-0000-000000000000', '30956f4a-2fe6-4ae9-be7e-09ac18832d9b', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-30 19:35:38.384731+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c2be753-fe06-4b8e-849d-1acfab074aff', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-30 19:51:54.849296+00', ''),
	('00000000-0000-0000-0000-000000000000', '1ff18a1f-3c78-4631-9c03-dbb43a2fc50e', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-30 19:51:54.850894+00', ''),
	('00000000-0000-0000-0000-000000000000', '5b8ac08f-c94a-4fe3-9541-41a15dd4b30f', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-31 06:50:01.644206+00', ''),
	('00000000-0000-0000-0000-000000000000', '5d0c159a-182c-46a1-906a-758efd24cba1', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-31 06:50:01.659078+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e38e5981-a285-4c81-a34a-b301d6121222', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-31 07:09:09.80472+00', ''),
	('00000000-0000-0000-0000-000000000000', '7903a65c-daec-4e1c-8f8c-a51a47941b9c', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-31 07:09:09.807551+00', ''),
	('00000000-0000-0000-0000-000000000000', '8133b16c-3198-40ec-8f7f-70f3bed97880', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-31 08:29:10.364551+00', ''),
	('00000000-0000-0000-0000-000000000000', '0192c078-6e94-4221-80f4-69092944be18', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-05-31 08:29:10.369114+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd0d7de09-9f01-4028-8942-09e3b06de882', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-31 11:35:44.389309+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ab7dfe6c-6a1c-47f8-a28a-27a42d37fcbe', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-31 11:35:44.396444+00', ''),
	('00000000-0000-0000-0000-000000000000', '64e51036-707a-4f1f-b3b5-a709b7d10763', '{"action":"user_confirmation_requested","actor_id":"dcc2a532-204e-41b5-a18d-cbeda22df213","actor_name":"Andrei Pisarev","actor_username":"andrpisarev@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-05-31 11:39:10.225244+00', ''),
	('00000000-0000-0000-0000-000000000000', '0137871f-2a5a-46f3-80e2-166a31512053', '{"action":"user_signedup","actor_id":"dcc2a532-204e-41b5-a18d-cbeda22df213","actor_name":"Andrei Pisarev","actor_username":"andrpisarev@gmail.com","actor_via_sso":false,"log_type":"team"}', '2025-05-31 11:40:18.115789+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ad9c5f3c-9fc3-4f84-af7a-2903ef23fbc2', '{"action":"login","actor_id":"dcc2a532-204e-41b5-a18d-cbeda22df213","actor_name":"Andrei Pisarev","actor_username":"andrpisarev@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-05-31 11:41:17.096343+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a3aa28b1-959f-4123-8556-ab472c9bd5eb', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-31 14:13:48.306893+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f37d7682-1f56-4213-867f-63ce31cfa504', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-31 14:13:48.311985+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e26fafc8-139c-4a3d-89ae-7aea7b6ff8c3', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-31 19:26:39.291442+00', ''),
	('00000000-0000-0000-0000-000000000000', '43f27302-c324-4a7f-b08a-0894cb657fe8', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-05-31 19:26:39.302329+00', ''),
	('00000000-0000-0000-0000-000000000000', '2675e946-bd00-45ab-9f81-9ddb564cad4f', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-01 16:58:48.859097+00', ''),
	('00000000-0000-0000-0000-000000000000', '47964446-1cc1-4e69-b4fc-b1006b948cfd', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-01 16:58:48.868277+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c51ef566-5ee8-4e84-9f5d-4b5b02642722', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-01 19:00:46.046459+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c7e3dcb6-c715-4fbc-ae9b-97900fbbdb85', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-01 19:00:46.04928+00', ''),
	('00000000-0000-0000-0000-000000000000', '8615174f-7d9f-4c87-8781-6aa2fd0bff6c', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-01 21:27:16.841259+00', ''),
	('00000000-0000-0000-0000-000000000000', '542b337b-3304-41f7-9339-4e73ac7e6bf4', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-01 21:27:16.844611+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c0e1e659-d7e0-40e9-ad3f-7510145ee87c', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-02 13:38:23.294734+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a80f4c88-7c84-4249-9320-e22c0fca6b0c', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-02 13:38:23.300428+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b60192ce-8a71-4a4b-b51c-f3953f4b6b3c', '{"action":"token_refreshed","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-02 17:16:35.77734+00', ''),
	('00000000-0000-0000-0000-000000000000', '9bcc1179-a0d0-4cb8-952d-e2bbfb0b4537', '{"action":"token_revoked","actor_id":"f80838d7-5c01-4fb1-906d-6de22980b011","actor_name":"Konstantin Tokarev","actor_username":"konstantin.tokareff@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-06-02 17:16:35.77895+00', ''),
	('00000000-0000-0000-0000-000000000000', '76aea272-eb78-4666-8013-e045a35346e0', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-03 16:22:23.695216+00', ''),
	('00000000-0000-0000-0000-000000000000', '50581621-cb89-4545-9928-25b693bf2709', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-03 16:22:23.707228+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c61bf2b7-5213-4dc3-a6d5-345241af87f4', '{"action":"token_refreshed","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-03 17:09:01.580829+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a1078b5e-beed-4e3c-99d6-c60f04000fc4', '{"action":"token_revoked","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-03 17:09:01.583977+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a14d8e8d-976d-480e-8216-b72790469997', '{"action":"token_refreshed","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-03 19:03:06.620578+00', ''),
	('00000000-0000-0000-0000-000000000000', '9f686c90-f891-430b-9d79-60302ba4630c', '{"action":"token_revoked","actor_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","actor_name":"Mmeow","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-03 19:03:06.623862+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a8e18915-a7aa-4940-bd78-0c8574d29afc', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-03 19:38:16.952538+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f5782fbd-1fc2-4b17-95f5-cb5ce1c7e4bb', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-03 19:38:16.956683+00', ''),
	('00000000-0000-0000-0000-000000000000', '642b7572-d12b-4b0b-be0c-96d3ced4b150', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-03 23:00:52.969183+00', ''),
	('00000000-0000-0000-0000-000000000000', '3d1b14b2-3e71-4a1a-b8a0-4acdc61cca86', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-03 23:00:52.972097+00', ''),
	('00000000-0000-0000-0000-000000000000', '315bea25-4190-4c4f-9f1d-ac58b616c4d0', '{"action":"logout","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-03 23:00:54.645546+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da5b41e9-f432-498f-9e3f-8c362b20c6fc', '{"action":"login","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 10:43:36.505169+00', ''),
	('00000000-0000-0000-0000-000000000000', '1abc674b-0d8e-4d70-8ee8-3bb97796b2e9', '{"action":"logout","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 10:44:04.776337+00', ''),
	('00000000-0000-0000-0000-000000000000', '7092da9b-2528-43dd-95a2-de7665be27b3', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tumerkinaa@mail.ru","user_id":"8d6e1ad8-fb43-4c02-852c-97c7b52bb613","user_phone":""}}', '2025-06-04 10:45:02.270812+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fdd21a38-0b9d-4077-b1e1-b1f2bb60d96b', '{"action":"user_confirmation_requested","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-06-04 10:45:24.575497+00', ''),
	('00000000-0000-0000-0000-000000000000', '4f3fb1e5-4a8f-4a9b-aad4-f7350a0c1513', '{"action":"user_signedup","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"team"}', '2025-06-04 10:45:41.402867+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd09bf26-39c0-4dae-a208-aad9fd85e27c', '{"action":"login","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 10:45:45.219516+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f24f6362-921c-490c-af20-fe2ff3dc5398', '{"action":"logout","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 10:46:09.78265+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc9964fa-dd48-482a-93ee-4dc65f68d3e1', '{"action":"login","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 10:46:14.89485+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f8f63dc9-7238-4da4-ac86-33f50c62cbec', '{"action":"logout","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 10:47:14.801558+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ea964c3c-50be-45f4-871d-6e5f94af6ecc', '{"action":"login","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 10:47:21.993043+00', ''),
	('00000000-0000-0000-0000-000000000000', '288986c8-0260-4e17-8650-b5933a6bf612', '{"action":"logout","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 10:48:28.984833+00', ''),
	('00000000-0000-0000-0000-000000000000', '748602e0-d956-4d64-b5d1-e9f7baf1172c', '{"action":"login","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 10:48:35.926052+00', ''),
	('00000000-0000-0000-0000-000000000000', '8f5f9149-766f-4032-b8b4-3e92e6c82eeb', '{"action":"logout","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 10:49:13.590782+00', ''),
	('00000000-0000-0000-0000-000000000000', '7f0e45b0-10af-4e3d-ba3c-26c76b0ab27c', '{"action":"login","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 10:49:16.114711+00', ''),
	('00000000-0000-0000-0000-000000000000', '99b0a5d9-2de1-4a41-95be-348de8950515', '{"action":"logout","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 10:49:20.363714+00', ''),
	('00000000-0000-0000-0000-000000000000', '925b937a-4f13-452c-93fa-8ce92732d03c', '{"action":"login","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 10:49:25.165513+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e61da1f9-7198-455e-9cac-cb619baffa52', '{"action":"logout","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 11:02:17.138496+00', ''),
	('00000000-0000-0000-0000-000000000000', '67ae8354-682a-48c4-b8eb-fb2cf9026369', '{"action":"login","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 11:02:24.126749+00', ''),
	('00000000-0000-0000-0000-000000000000', '81348527-2319-4010-a192-134df1394fd6', '{"action":"logout","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 11:03:50.306543+00', ''),
	('00000000-0000-0000-0000-000000000000', '9f5614fd-b08d-4ad3-90dc-73bbc1e22ddb', '{"action":"login","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 11:04:22.014273+00', ''),
	('00000000-0000-0000-0000-000000000000', '58e08585-f089-469f-9cfe-e9b676f94619', '{"action":"logout","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 11:05:09.581893+00', ''),
	('00000000-0000-0000-0000-000000000000', '10cda7c1-1845-4a21-a299-50b84f54a34e', '{"action":"login","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 11:05:11.91245+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c5f2f912-a936-4778-8c3e-16e6a542e4ff', '{"action":"logout","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 11:05:15.417408+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b27ac8f5-c8e2-491f-b97d-6bf12be90e0d', '{"action":"login","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 11:05:20.917816+00', ''),
	('00000000-0000-0000-0000-000000000000', '744e14a2-718d-47bc-bd53-fb177a776409', '{"action":"logout","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 11:06:19.431218+00', ''),
	('00000000-0000-0000-0000-000000000000', '625c5123-ad38-4086-aec4-5b60e4af6808', '{"action":"login","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 11:06:24.107161+00', ''),
	('00000000-0000-0000-0000-000000000000', 'caf289c6-1da9-41fb-9492-4eda83f4a6e1', '{"action":"logout","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 11:15:26.308302+00', ''),
	('00000000-0000-0000-0000-000000000000', '0ddd59c4-f2fd-40cd-ba15-1566db1d88e4', '{"action":"login","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 11:15:34.535227+00', ''),
	('00000000-0000-0000-0000-000000000000', '49570ac0-3720-40f1-992d-6ed581587674', '{"action":"logout","actor_id":"ba1aef95-db05-4ecd-9cf6-1819fe7ee819","actor_name":"Tumerkina","actor_username":"tumerkinaa@mail.ru","actor_via_sso":false,"log_type":"account"}', '2025-06-04 11:16:07.210556+00', ''),
	('00000000-0000-0000-0000-000000000000', '79f955b5-9194-4689-bc89-ea809923574c', '{"action":"login","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-06-04 11:16:14.234079+00', ''),
	('00000000-0000-0000-0000-000000000000', '904a73c2-14b7-4d6c-bf1d-0ce03aacf1dc', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-04 12:14:54.539105+00', ''),
	('00000000-0000-0000-0000-000000000000', '035d9aff-781b-458a-9d1d-1248b4ef7a93', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-04 12:14:54.543106+00', ''),
	('00000000-0000-0000-0000-000000000000', '01534175-e15c-4c81-9de0-143d14d8e717', '{"action":"token_refreshed","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-04 13:13:26.049375+00', ''),
	('00000000-0000-0000-0000-000000000000', '9089aa8b-f1c5-4282-8dd1-9668bb9bb27a', '{"action":"token_revoked","actor_id":"2c1979f5-ca56-4d24-812c-1aadb8409e88","actor_name":"Test","actor_username":"malya_tate@mail.ru","actor_via_sso":false,"log_type":"token"}', '2025-06-04 13:13:26.053558+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'dcc2a532-204e-41b5-a18d-cbeda22df213', 'authenticated', 'authenticated', 'andrpisarev@gmail.com', '$2a$10$mSmxfTsPiIzULPtrlC44HuTM/W2h9/2gUO/dPuqADBHTiCKWy.Nqi', '2025-05-31 11:40:18.118152+00', NULL, '', '2025-05-31 11:39:10.22829+00', '', NULL, '', '', NULL, '2025-05-31 11:41:17.097056+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "dcc2a532-204e-41b5-a18d-cbeda22df213", "email": "andrpisarev@gmail.com", "full_name": "Andrei Pisarev", "email_verified": true, "phone_verified": false}', NULL, '2025-05-31 11:39:10.20019+00', '2025-05-31 11:41:17.09946+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', 'authenticated', 'authenticated', 'tumerkinaa@mail.ru', '$2a$10$fxnFXG.pNaFLxXC.m5W7geBN0RN.JKt0B9NfVyXhR7oaa5ilVb.S2', '2025-06-04 10:45:41.403489+00', NULL, '', '2025-06-04 10:45:24.57733+00', '', NULL, '', '', NULL, '2025-06-04 11:15:34.535977+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "ba1aef95-db05-4ecd-9cf6-1819fe7ee819", "email": "tumerkinaa@mail.ru", "full_name": "Tumerkina", "email_verified": true, "phone_verified": false}', NULL, '2025-06-04 10:45:24.558481+00', '2025-06-04 11:15:34.53894+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'fb016f65-cdc2-444f-aae8-73b26ebdcb5b', 'authenticated', 'authenticated', 'mmeow0@mail.ru', '$2a$10$3DcfDMEgZ/W5biSelak.EusmcyOgD05.bU1/Y3Tk0qQBP0fH96PGa', NULL, NULL, '93b1fb361e2f0cb4d575b5e9cfe5293e6e7147b3f59b15bcc902fc50', '2025-05-19 21:36:38.136984+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "fb016f65-cdc2-444f-aae8-73b26ebdcb5b", "email": "mmeow0@mail.ru", "full_name": "Test", "email_verified": false, "phone_verified": false}', NULL, '2025-05-19 21:36:38.098838+00', '2025-05-19 21:36:38.40622+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2c1979f5-ca56-4d24-812c-1aadb8409e88', 'authenticated', 'authenticated', 'malya_tate@mail.ru', '$2a$10$k2G49PRY8os9RnW2Ndb7AOvfgAyn6gL71pPU/y83Lo21eCFTwsymu', '2025-05-23 15:52:30.984836+00', NULL, '', '2025-05-23 15:51:42.750326+00', '', NULL, '', '', NULL, '2025-06-04 11:16:14.234786+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "2c1979f5-ca56-4d24-812c-1aadb8409e88", "email": "malya_tate@mail.ru", "full_name": "Test", "email_verified": true, "phone_verified": false}', NULL, '2025-05-23 15:51:42.743496+00', '2025-06-04 13:13:26.057193+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f80838d7-5c01-4fb1-906d-6de22980b011', 'authenticated', 'authenticated', 'konstantin.tokareff@gmail.com', '$2a$10$pzvE5uUzvtu/o9w6n5zaqe5RfBQnaKkoRkPDKV.OPtS4yLkUbxeai', '2025-05-23 15:47:10.918319+00', NULL, '', '2025-05-23 15:46:35.670632+00', '', NULL, '', '', NULL, '2025-05-30 07:18:56.395819+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "f80838d7-5c01-4fb1-906d-6de22980b011", "email": "konstantin.tokareff@gmail.com", "full_name": "Konstantin Tokarev", "email_verified": true, "phone_verified": false}', NULL, '2025-05-23 15:46:35.640879+00', '2025-06-02 17:16:35.790235+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('fb016f65-cdc2-444f-aae8-73b26ebdcb5b', 'fb016f65-cdc2-444f-aae8-73b26ebdcb5b', '{"sub": "fb016f65-cdc2-444f-aae8-73b26ebdcb5b", "email": "mmeow0@mail.ru", "full_name": "Test", "email_verified": false, "phone_verified": false}', 'email', '2025-05-19 21:36:38.122014+00', '2025-05-19 21:36:38.122076+00', '2025-05-19 21:36:38.122076+00', 'e608b4ce-a51f-4835-98ba-6d6b730281c6'),
	('f80838d7-5c01-4fb1-906d-6de22980b011', 'f80838d7-5c01-4fb1-906d-6de22980b011', '{"sub": "f80838d7-5c01-4fb1-906d-6de22980b011", "email": "konstantin.tokareff@gmail.com", "full_name": "Konstantin Tokarev", "email_verified": true, "phone_verified": false}', 'email', '2025-05-23 15:46:35.655639+00', '2025-05-23 15:46:35.655709+00', '2025-05-23 15:46:35.655709+00', '5d3ae455-25ed-44b8-9bd2-3f9beeb44195'),
	('2c1979f5-ca56-4d24-812c-1aadb8409e88', '2c1979f5-ca56-4d24-812c-1aadb8409e88', '{"sub": "2c1979f5-ca56-4d24-812c-1aadb8409e88", "email": "malya_tate@mail.ru", "full_name": "Test", "email_verified": true, "phone_verified": false}', 'email', '2025-05-23 15:51:42.746863+00', '2025-05-23 15:51:42.746912+00', '2025-05-23 15:51:42.746912+00', '414ae37b-b7c9-4d43-948c-6ec7736be6df'),
	('dcc2a532-204e-41b5-a18d-cbeda22df213', 'dcc2a532-204e-41b5-a18d-cbeda22df213', '{"sub": "dcc2a532-204e-41b5-a18d-cbeda22df213", "email": "andrpisarev@gmail.com", "full_name": "Andrei Pisarev", "email_verified": true, "phone_verified": false}', 'email', '2025-05-31 11:39:10.216881+00', '2025-05-31 11:39:10.216935+00', '2025-05-31 11:39:10.216935+00', '269fe045-350a-4a96-94ca-af5e76b1d24b'),
	('ba1aef95-db05-4ecd-9cf6-1819fe7ee819', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', '{"sub": "ba1aef95-db05-4ecd-9cf6-1819fe7ee819", "email": "tumerkinaa@mail.ru", "full_name": "Tumerkina", "email_verified": true, "phone_verified": false}', 'email', '2025-06-04 10:45:24.571272+00', '2025-06-04 10:45:24.571336+00', '2025-06-04 10:45:24.571336+00', '4dc35dde-7acd-458e-bf7b-146cc51ac0c8');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('6082c29a-34a0-40c5-bf0e-79ee1bce80f0', '2c1979f5-ca56-4d24-812c-1aadb8409e88', '2025-06-04 11:16:14.234862+00', '2025-06-04 13:13:26.061266+00', NULL, 'aal1', NULL, '2025-06-04 13:13:26.061195', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15', '89.150.35.39', NULL),
	('6589c54a-32ed-4f80-99f5-92b7536fedfb', 'f80838d7-5c01-4fb1-906d-6de22980b011', '2025-05-23 15:47:10.925071+00', '2025-05-23 15:47:10.925071+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36', '85.94.250.187', NULL),
	('0eb0f5e7-12aa-4e84-9742-3f295e3d70f4', 'f80838d7-5c01-4fb1-906d-6de22980b011', '2025-05-23 15:53:34.089799+00', '2025-05-27 09:40:37.114716+00', NULL, 'aal1', NULL, '2025-05-27 09:40:37.114625', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36', '85.94.250.187', NULL),
	('bb9e26d2-f933-4f0a-86bf-0983c843af39', 'f80838d7-5c01-4fb1-906d-6de22980b011', '2025-05-27 09:40:38.14822+00', '2025-05-30 07:18:55.705094+00', NULL, 'aal1', NULL, '2025-05-30 07:18:55.704437', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36', '212.7.174.249', NULL),
	('05037343-c9b2-498e-a013-2dd66e9a4302', 'dcc2a532-204e-41b5-a18d-cbeda22df213', '2025-05-31 11:40:18.12726+00', '2025-05-31 11:40:18.12726+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15', '2a00:1370:8182:ecac:79d3:d2bc:36da:ace4', NULL),
	('13cb7a25-4211-4d50-9dd3-442e60da01c5', 'dcc2a532-204e-41b5-a18d-cbeda22df213', '2025-05-31 11:41:17.097725+00', '2025-05-31 11:41:17.097725+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15', '2a00:1370:8182:ecac:79d3:d2bc:36da:ace4', NULL),
	('561a0fc1-cc1a-48b1-96a0-832339fed5a3', 'f80838d7-5c01-4fb1-906d-6de22980b011', '2025-05-30 07:18:56.396559+00', '2025-06-02 17:16:35.793101+00', NULL, 'aal1', NULL, '2025-06-02 17:16:35.79303', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36', '85.94.250.187', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('6589c54a-32ed-4f80-99f5-92b7536fedfb', '2025-05-23 15:47:10.936332+00', '2025-05-23 15:47:10.936332+00', 'otp', '36adcd2c-da07-4bd6-ab96-5d9ee6955a18'),
	('0eb0f5e7-12aa-4e84-9742-3f295e3d70f4', '2025-05-23 15:53:34.091721+00', '2025-05-23 15:53:34.091721+00', 'password', '10885770-f4ad-4cd8-bc9a-608da6bc9d3e'),
	('bb9e26d2-f933-4f0a-86bf-0983c843af39', '2025-05-27 09:40:38.161369+00', '2025-05-27 09:40:38.161369+00', 'password', 'adb9f211-b171-44c6-af71-12c9d07f72d5'),
	('561a0fc1-cc1a-48b1-96a0-832339fed5a3', '2025-05-30 07:18:56.403794+00', '2025-05-30 07:18:56.403794+00', 'password', 'df493dfe-1df5-4b5d-b9cb-3361ea9005a7'),
	('05037343-c9b2-498e-a013-2dd66e9a4302', '2025-05-31 11:40:18.142147+00', '2025-05-31 11:40:18.142147+00', 'otp', 'c595c188-7652-40af-93ef-5ce7abe85ab1'),
	('13cb7a25-4211-4d50-9dd3-442e60da01c5', '2025-05-31 11:41:17.099785+00', '2025-05-31 11:41:17.099785+00', 'password', 'f0a40d23-0710-411a-adf6-cd0c13ae1a12'),
	('6082c29a-34a0-40c5-bf0e-79ee1bce80f0', '2025-06-04 11:16:14.236966+00', '2025-06-04 11:16:14.236966+00', 'password', 'd04baceb-89f4-4526-ad7a-773f77590a47');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") VALUES
	('7c658e9b-8b99-4af2-b3c6-bf9da5e3c483', 'fb016f65-cdc2-444f-aae8-73b26ebdcb5b', 'confirmation_token', '93b1fb361e2f0cb4d575b5e9cfe5293e6e7147b3f59b15bcc902fc50', 'mmeow0@mail.ru', '2025-05-19 21:36:38.413712', '2025-05-19 21:36:38.413712');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 104, '6zor7nadzrhn', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-23 20:19:59.91538+00', '2025-05-25 17:26:06.508301+00', 'zpwsmnp4v4an', '0eb0f5e7-12aa-4e84-9742-3f295e3d70f4'),
	('00000000-0000-0000-0000-000000000000', 106, '4jg36asdcgva', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-25 17:26:06.517112+00', '2025-05-25 18:46:14.961121+00', '6zor7nadzrhn', '0eb0f5e7-12aa-4e84-9742-3f295e3d70f4'),
	('00000000-0000-0000-0000-000000000000', 107, 'tib5nsjcfnr2', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-25 18:46:14.965979+00', '2025-05-27 09:40:37.086918+00', '4jg36asdcgva', '0eb0f5e7-12aa-4e84-9742-3f295e3d70f4'),
	('00000000-0000-0000-0000-000000000000', 109, '2hwjpdqtrcy4', 'f80838d7-5c01-4fb1-906d-6de22980b011', false, '2025-05-27 09:40:37.095046+00', '2025-05-27 09:40:37.095046+00', 'tib5nsjcfnr2', '0eb0f5e7-12aa-4e84-9742-3f295e3d70f4'),
	('00000000-0000-0000-0000-000000000000', 110, 'ivz3ovso2u6g', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-27 09:40:38.15696+00', '2025-05-30 07:18:55.679691+00', NULL, 'bb9e26d2-f933-4f0a-86bf-0983c843af39'),
	('00000000-0000-0000-0000-000000000000', 114, 'vhz7eqqezrrg', 'f80838d7-5c01-4fb1-906d-6de22980b011', false, '2025-05-30 07:18:55.687953+00', '2025-05-30 07:18:55.687953+00', 'ivz3ovso2u6g', 'bb9e26d2-f933-4f0a-86bf-0983c843af39'),
	('00000000-0000-0000-0000-000000000000', 115, '3rr2edx5kyej', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-30 07:18:56.401908+00', '2025-05-30 08:33:25.71428+00', NULL, '561a0fc1-cc1a-48b1-96a0-832339fed5a3'),
	('00000000-0000-0000-0000-000000000000', 157, 'ndh6qch5vb3b', '2c1979f5-ca56-4d24-812c-1aadb8409e88', true, '2025-06-04 11:16:14.235679+00', '2025-06-04 12:14:54.543683+00', NULL, '6082c29a-34a0-40c5-bf0e-79ee1bce80f0'),
	('00000000-0000-0000-0000-000000000000', 158, 'nz77mzi3t5rq', '2c1979f5-ca56-4d24-812c-1aadb8409e88', true, '2025-06-04 12:14:54.548304+00', '2025-06-04 13:13:26.054134+00', 'ndh6qch5vb3b', '6082c29a-34a0-40c5-bf0e-79ee1bce80f0'),
	('00000000-0000-0000-0000-000000000000', 116, 'jcv2xj6c75cc', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-30 08:33:25.716135+00', '2025-05-30 16:42:02.793041+00', '3rr2edx5kyej', '561a0fc1-cc1a-48b1-96a0-832339fed5a3'),
	('00000000-0000-0000-0000-000000000000', 159, 'jr2ikdgx4g7w', '2c1979f5-ca56-4d24-812c-1aadb8409e88', false, '2025-06-04 13:13:26.056061+00', '2025-06-04 13:13:26.056061+00', 'nz77mzi3t5rq', '6082c29a-34a0-40c5-bf0e-79ee1bce80f0'),
	('00000000-0000-0000-0000-000000000000', 120, 'ymr3tnp3lkau', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-30 16:42:02.795205+00', '2025-05-30 17:41:37.864721+00', 'jcv2xj6c75cc', '561a0fc1-cc1a-48b1-96a0-832339fed5a3'),
	('00000000-0000-0000-0000-000000000000', 122, 'uj57nbphxszi', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-30 17:41:37.870297+00', '2025-05-30 19:35:38.385313+00', 'ymr3tnp3lkau', '561a0fc1-cc1a-48b1-96a0-832339fed5a3'),
	('00000000-0000-0000-0000-000000000000', 123, 'se7wwnblxvb6', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-30 19:35:38.387231+00', '2025-05-31 07:09:09.808063+00', 'uj57nbphxszi', '561a0fc1-cc1a-48b1-96a0-832339fed5a3'),
	('00000000-0000-0000-0000-000000000000', 126, 'xj7sbhyxq3z7', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-31 07:09:09.810695+00', '2025-05-31 08:29:10.37139+00', 'se7wwnblxvb6', '561a0fc1-cc1a-48b1-96a0-832339fed5a3'),
	('00000000-0000-0000-0000-000000000000', 129, 'fm42gj5ndxxi', 'dcc2a532-204e-41b5-a18d-cbeda22df213', false, '2025-05-31 11:40:18.136875+00', '2025-05-31 11:40:18.136875+00', NULL, '05037343-c9b2-498e-a013-2dd66e9a4302'),
	('00000000-0000-0000-0000-000000000000', 130, 'wk42dz5fxuh2', 'dcc2a532-204e-41b5-a18d-cbeda22df213', false, '2025-05-31 11:41:17.098532+00', '2025-05-31 11:41:17.098532+00', NULL, '13cb7a25-4211-4d50-9dd3-442e60da01c5'),
	('00000000-0000-0000-0000-000000000000', 97, 'shaxj3psj5be', 'f80838d7-5c01-4fb1-906d-6de22980b011', false, '2025-05-23 15:47:10.927867+00', '2025-05-23 15:47:10.927867+00', NULL, '6589c54a-32ed-4f80-99f5-92b7536fedfb'),
	('00000000-0000-0000-0000-000000000000', 100, 'luwux5a7wffm', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-23 15:53:34.090534+00', '2025-05-23 18:10:05.103312+00', NULL, '0eb0f5e7-12aa-4e84-9742-3f295e3d70f4'),
	('00000000-0000-0000-0000-000000000000', 127, 'bvyujzmul5z7', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-31 08:29:10.37435+00', '2025-06-01 16:58:48.870691+00', 'xj7sbhyxq3z7', '561a0fc1-cc1a-48b1-96a0-832339fed5a3'),
	('00000000-0000-0000-0000-000000000000', 101, 'vju45kebbfpp', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-23 18:10:05.107053+00', '2025-05-23 19:08:59.392517+00', 'luwux5a7wffm', '0eb0f5e7-12aa-4e84-9742-3f295e3d70f4'),
	('00000000-0000-0000-0000-000000000000', 103, 'zpwsmnp4v4an', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-05-23 19:08:59.394614+00', '2025-05-23 20:19:59.912124+00', 'vju45kebbfpp', '0eb0f5e7-12aa-4e84-9742-3f295e3d70f4'),
	('00000000-0000-0000-0000-000000000000', 133, 'qtdxkb64az7o', 'f80838d7-5c01-4fb1-906d-6de22980b011', true, '2025-06-01 16:58:48.878306+00', '2025-06-02 17:16:35.7795+00', 'bvyujzmul5z7', '561a0fc1-cc1a-48b1-96a0-832339fed5a3'),
	('00000000-0000-0000-0000-000000000000', 137, 'mck5uqe5uymg', 'f80838d7-5c01-4fb1-906d-6de22980b011', false, '2025-06-02 17:16:35.781672+00', '2025-06-02 17:16:35.781672+00', 'qtdxkb64az7o', '561a0fc1-cc1a-48b1-96a0-832339fed5a3');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: business_functions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."business_functions" ("id", "name") VALUES
	('a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', 'Marketing'),
	('b2c3d4e5-f6a7-48b9-b0c1-d2e3f4a5b6c7', 'Sales'),
	('c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8', 'Operations'),
	('d4e5f6a7-b8c9-40d1-d2e3-f4a5b6c7d8e9', 'Human Resources'),
	('e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0', 'Research & Development'),
	('97de20a9-3442-4adb-b83c-693df1a214a7', 'AI Development'),
	('0d76dd28-b341-4af2-8271-364a5cbd3d9f', 'Accounting'),
	('acf10317-f1e2-4b82-bc73-6960f8bbc3c2', 'Administration'),
	('52a4cd2b-b3f1-4891-a015-5379a25f7e9b', 'Analysis'),
	('6d861695-6cfd-4570-b392-4ff1ea2dd49d', 'Animation'),
	('dd2e8194-06fd-4dd2-a41b-9f484fe27703', 'Art and Design'),
	('3ec36bf8-9e4c-4343-ac7e-a2336638e836', 'Assembly'),
	('626653c7-dd5e-45c5-bcb2-6441601d5c28', 'Assessment'),
	('ce9511fd-edcf-4159-9361-0e48013bfaaf', 'Automation'),
	('725eed57-9ac4-4a13-8595-1e3ac851a6be', 'Bioinformatics'),
	('25edc394-e9d1-400c-b81b-ea766900a0b9', 'Broadcasting'),
	('08b9a54a-86d7-46b8-8fcf-42bfb9d5dd21', 'Business Intelligence'),
	('bb7c79fb-eaba-43af-813a-de1ca8165e7e', 'Case Management'),
	('d7c532f1-4a7b-49bf-a72b-09a83428bf29', 'Clinical Assessment'),
	('845941e4-3756-4dff-b678-cc2f21bdbc22', 'Clinical Assessments'),
	('5f03b599-d52d-4e03-bec2-fd9a0ec8d639', 'Clinical Data Analysis'),
	('86daf74a-9d28-4031-b5e5-1a47f50c0956', 'Clinical Decision Support'),
	('c6b24b11-99b1-42c3-866d-735cc51ef106', 'Clinical Operations'),
	('a8017619-fd95-48ce-a55c-c150e5e62e3f', 'Clinical Research'),
	('c9a2799b-1e95-4471-832d-b1724462864e', 'Clinical Support'),
	('f17a677f-f16c-432c-8411-c92a63ab4f21', 'Collaboration Management'),
	('c460df91-ab57-4f88-a97a-7b4e154383d3', 'Compliance'),
	('610bc547-4619-49b5-8515-a8564e60f7dd', 'Compliance Monitoring'),
	('a5e591b2-3e04-4401-b801-5b474b3b20d5', 'Compliance and Ethics'),
	('980f8d72-9ba1-4832-86ae-8bd37d236402', 'Compliance and Risk Management'),
	('e6a0b27f-eb2a-464f-9835-a29385ea9cf8', 'Content Creation'),
	('f2f12032-b4ee-4104-8e6f-d60fcf0fef13', 'Content Development'),
	('2969efba-2497-4904-aa87-86590b22bad8', 'Content Generation'),
	('a2b8f8b8-eb0b-4bfb-9015-e3186fd0eb73', 'Content Management'),
	('9e183bd8-a0ea-4cc4-b2d6-fc6a1bd58a77', 'Content Moderation'),
	('43faba77-13c6-4a7c-abe8-ae8e9e86ece6', 'Content Production'),
	('4a024bd0-dff9-4a93-9ec2-c9b8df00cf94', 'Content Verification'),
	('0937f680-3947-4f1a-809b-1938f7803193', 'Corporate Strategy'),
	('678d7f5f-df52-48d8-b96d-f92b9a0371cc', 'Creative Development'),
	('a5534194-3209-4041-b08d-f6a63af3747d', 'Creative Services'),
	('49281310-dec5-4d75-b569-cd9a0db42258', 'Crisis Management'),
	('ff4ad167-c0b9-48ff-88f2-11cf4a419d0b', 'Customer Analytics'),
	('d6809797-083b-47b9-add7-a5b0770c8d1d', 'Customer Engagement'),
	('96a76a9e-5150-48c7-9ea1-a7817a132eb2', 'Customer Experience'),
	('ea328f74-d932-405b-be89-640366c8e509', 'Customer Insights'),
	('e7af7ffb-1891-4c05-8545-d3062773a8ee', 'Customer Relationship Management'),
	('8534821d-4438-49a2-96b3-e481405ec83c', 'Customer Service'),
	('d2d49bbf-dd93-4483-88c1-aa1b5862f78e', 'Customer Support'),
	('1f9c64ff-161f-4661-a49e-339ec47a62a3', 'Cybersecurity'),
	('cedffcf7-1d72-42b1-bafa-eaec6eaf8c31', 'Data Analysis'),
	('9f050eab-a793-4740-8bbc-a40d0b32ffbf', 'Data Analytics'),
	('4d0b1419-e0e8-4a0f-ae45-d55b9b1eecf7', 'Data Management'),
	('b4290b49-75da-42d4-8ed8-46ee50a85fa0', 'Data Privacy'),
	('b98fe3f0-5ad3-4225-b93e-0072b0e46d09', 'Data Processing'),
	('b1585fe7-0b70-469e-b5a9-1d8c7313b259', 'Database Management'),
	('af22cfac-030c-49cd-8ed7-6b863bedbf5d', 'Decision Support'),
	('785b5011-d489-4b28-8ef2-dc503fa16db4', 'Decision-Making'),
	('60f7ff81-5bd6-4847-bf12-38a25c020b1c', 'Design'),
	('4c27b9ec-575c-43e8-ae19-f4a0a673096f', 'Development'),
	('3799bc57-7684-46ef-bcae-6e12c58f030f', 'DevOps'),
	('5b0b38ec-2d0b-49af-afb3-97a88ff9a965', 'Digital Security'),
	('172d3440-7e65-4816-a86d-3ea1100eeab5', 'Diagnostics'),
	('1e884f74-32f8-485b-816b-1ef56e063b61', 'Document Management'),
	('4c6e075e-14d3-4c0b-8aa8-06ac54e47ca0', 'E-learning'),
	('ce7cee1d-7654-4911-890f-7e18a215aa57', 'Education'),
	('9f75571d-e962-4506-943c-554ddfe832f8', 'Education and Training'),
	('f98e41aa-2226-4a29-8ca4-a27c1a27309a', 'Education Technology'),
	('587fd89a-7501-4276-8a3d-e42e766901a9', 'Emergency Services'),
	('fb04e797-db45-4982-af65-b0c41bf9d62c', 'Engineering'),
	('e6d53194-17c4-45fe-8ecb-3bffea08ab54', 'Ethics and Governance'),
	('cba2bc35-e865-4062-9ecb-61c61334695a', 'Ethics Training'),
	('487a7b78-5c42-4182-b5eb-6a9156983f88', 'Facility Management'),
	('5d8b8289-1d99-47a3-97ec-faae6cc5c900', 'Farm Management'),
	('b4c62801-9080-45e2-9371-8d47762c7360', 'Finance'),
	('c6435cea-ea63-4404-a104-56af62a620d1', 'Financial Advisory Services'),
	('a85636de-7e07-4493-b2b3-3615f077c1a6', 'Financial Analysis'),
	('99695520-8971-4fa6-94d2-3fa0c4e79b4f', 'Financial Reporting'),
	('90e89259-22ff-45fe-92f8-d44ce3d8d3ff', 'Forecasting'),
	('7f7faa1a-2222-4c2c-9af0-358bac79962e', 'Fraud Detection'),
	('b82fd3c6-ca46-4be0-a285-cbbcc5867052', 'Funding Allocation'),
	('3e3239d1-2dd2-4cc9-bd1f-344ae78cfb81', 'Game Development'),
	('b83fd351-3152-4bde-a622-d5ef0cea0358', 'Health Data Management'),
	('a40f22b6-28c6-4991-b65d-88bc07c84249', 'Healthcare Administration'),
	('c6c1f6ee-f33e-41fc-a57d-6de996af8ec0', 'Healthcare Management'),
	('b1aa29bd-84f2-48c5-a679-95193e5aa971', 'Healthcare Technology Development'),
	('40cb9de8-e47b-4605-b1a9-a2eb721ec17b', 'Home Automation'),
	('9aa9a72a-c18e-45d1-b7b7-c212ad4e52c3', 'Incident Management'),
	('77c8035a-4299-4967-acdb-e25e6fe5c549', 'Instrumentation Technology'),
	('c5c2fe36-f66d-4c07-b54a-450a1bc3a68e', 'Intellectual Property Management'),
	('1ec61447-33a9-4e3b-9e0b-ba6e18dc3a93', 'IT Infrastructure'),
	('ed01d228-c852-4df2-9bdf-92edd635f55c', 'IT Operations'),
	('ad24fb5b-2749-40e6-9248-fd1143ed7e15', 'IT Support'),
	('a6bfd258-4972-404c-a470-cb082d3b978f', 'IT Security'),
	('75aeda88-b25c-40be-a3f3-76af2b4d125f', 'Knowledge Management'),
	('bf87ed4e-3bcf-4d2f-9d10-5ed257a8dd50', 'Learning Management'),
	('c550eedc-0430-4e49-9f53-1c225f26a345', 'Legal Compliance'),
	('b0c1ca15-726c-4598-9409-5a7de7cbed77', 'Legal Research'),
	('0f87a0ed-7c84-4d8a-9104-9bfd276f0dc1', 'Logistics'),
	('f001ebd0-8d08-4a92-8359-97f3c3a98220', 'Machine Learning'),
	('08803314-8e79-44d9-83ca-bcebb87647b3', 'Machine Learning Engineering'),
	('308db732-300c-4f4c-9808-d75dabc96c0c', 'Machine Learning Operations'),
	('0fbcd35a-6c11-4790-b6a0-f7fb019645b3', 'Manufacturing'),
	('a80662a0-8766-4518-8b8f-65045f944869', 'Market Analysis'),
	('bbc2283d-17c1-4319-9725-dbd91c096e99', 'Market Research'),
	('24cc74dd-2174-4cdb-95d2-2f7212c906df', 'Marketing Analytics'),
	('48e738a5-145f-4f41-9fcc-e9c06c061afa', 'Media Production'),
	('ebd5688c-efe0-4afe-9900-ee44accd4954', 'Model Evaluation'),
	('4c1ccce4-52b2-4b9d-974a-5f6e360ff94b', 'Model Risk Management'),
	('b44b47f7-23a7-429e-9e2e-543ba0bb8706', 'Model Training'),
	('428f5916-6fae-4d9a-b2e8-cedbfbdedb25', 'Natural Language Processing'),
	('6c82eac6-3a54-4a5d-8290-823cc94bb598', 'Network Management'),
	('27a7015a-9089-478d-a62e-713c26a482be', 'Network Optimization'),
	('63a8c210-fdb8-4173-b333-1da702e13dc5', 'Operational Efficiency'),
	('75dcfac2-233a-4a39-b5f3-9e36de7ebadd', 'Operations Management'),
	('46700fd5-fa20-4a5e-ad03-f33a1f276cbc', 'Optimization and Analytics'),
	('6e2d8f3f-ef70-4472-b965-122652d43f52', 'Patient Management'),
	('0a3dbc9c-43a9-442c-b8f5-f112936febee', 'Patient Monitoring'),
	('6dcd18cc-023e-4c4d-92fe-7ae8d5c3f85f', 'Patient Risk Management'),
	('66bcefc1-c8d2-457e-a2fc-4863fec59506', 'Policy Development'),
	('cb6875dd-2e68-46da-b1f1-17d052d680b0', 'Portfolio Management'),
	('90a70f7f-d5ef-419c-8585-85be662e4646', 'Population Health Management'),
	('08f403ec-4637-43dc-af23-ea5e9f7fd32d', 'Process Automation'),
	('9b86e31a-4860-4404-9859-855ff9cb2572', 'Process Optimization'),
	('9182b916-fb2d-4fd2-8df1-382082e0fc8a', 'Product Design'),
	('803d7932-04ce-4d81-bafd-67ed2a266345', 'Product Development'),
	('8872ec63-3230-4dc7-b64e-7d22bc6dbc74', 'Product Engineering'),
	('e8343fab-87b0-4faa-9dd8-e4717e861ba5', 'Product Evaluation'),
	('2e305a62-0f94-4d52-b1b5-eabdf7d24a16', 'Product Innovation'),
	('c260ea29-8bb5-4076-bccc-7cd324a5752e', 'Product Management'),
	('d82d4d35-f1f7-4ce1-bd98-e38b33758141', 'Production'),
	('d7260e7c-a827-484c-a2b5-dc22561994a5', 'Project Management'),
	('bb7ccc4c-f74d-4648-9340-ba5dc95821b9', 'Public Relations'),
	('ee6d942d-12c8-4fbc-8390-fbe7e32c47fd', 'Quality Assurance'),
	('58fd728e-d962-4b56-9817-168028d0cc97', 'Quality Control'),
	('3b7ab7d2-b198-4330-ae0d-eaf35d6606ad', 'R&D'),
	('23cba351-da65-4268-833f-bd18bc160b01', 'Radiology'),
	('977d0e2f-db8a-47d2-8472-faa0b181547b', 'Regulatory Affairs'),
	('f58ac83a-db45-481a-b87d-6a8c1211e98a', 'Regulatory Compliance'),
	('a404d5cd-b29a-43bd-b894-be2d0e45bcec', 'Report Generation'),
	('226c757d-0d4d-4904-bd83-f4c201ca97d2', 'Reporting'),
	('468db778-a90b-425f-80b3-a6a52ceeef9d', 'Requirements Management'),
	('0ac95ff5-2aa5-46bf-8f70-d7225756cb58', 'Research'),
	('0d639b62-705e-4611-ab70-e3f9326e3884', 'Research and Development'),
	('8e5f9c11-a736-44db-9f77-64701c954ad5', 'Rights Management'),
	('4d5ccb18-3f29-4f4c-8d9b-d58566b2dfcd', 'Risk Management'),
	('aaae2251-7238-4553-a953-7f0fde4e3095', 'Safety'),
	('f9bc455a-5eed-4418-9785-a4938d1ee8df', 'Safety Analysis'),
	('e8bceaf2-2d65-48d0-950b-207818ed2864', 'Safety Compliance'),
	('314e07ad-4a22-4b2d-8c23-fb92a4d60fca', 'Safety Management'),
	('9a758950-c98c-4c8f-834a-5f8fdc2f54db', 'Sales Forecasting'),
	('e357b902-8bb9-4696-96c7-ca4a479980db', 'Sales Management'),
	('64e2f499-5ae1-4a22-ba29-dbc13ca32fe3', 'Sales and Marketing'),
	('725809c9-d92b-4da9-acb1-f1ae3cf32329', 'Search and Rescue'),
	('b54c7179-2b05-4e60-9c58-db19b0fbcde9', 'Security'),
	('21f3891f-ba2a-441b-a2c3-7fccc25bf6b8', 'Security Operations'),
	('89493be8-def9-473b-a721-6eb010d060dc', 'Simulation'),
	('de3803b1-27ba-4eb1-afe3-a9ac3482e9dd', 'Simulation and Analysis'),
	('2af25d42-b453-4277-97a7-24d90d6bb4c0', 'Simulation and Modeling'),
	('42eded43-d1fb-4528-b39c-f7147d3d541a', 'Software Development'),
	('2fd4151d-7ef8-4c73-b443-e6f586c9a021', 'Software Engineering'),
	('55d31790-70f2-4fed-b35a-f54543eda4e7', 'Software Testing'),
	('28d2b2ba-da11-4185-9c1b-0e6b8f87b443', 'Strategic Planning'),
	('d0415af6-ebe8-478d-9015-4205dd3f30f2', 'Student Assessment'),
	('cddcd1a8-16a6-43af-963a-6ecba2b49e4e', 'Student Services'),
	('5a2178c5-bee4-4db4-a076-0b626a4ebd2d', 'Supply Chain'),
	('bf05fed3-db9a-4c40-baee-4113364a44f0', 'Supply Chain Management'),
	('2726f457-ea7e-4255-bc1e-98762091e891', 'Supply chain planning'),
	('41e556af-7edc-4874-88ad-cb88730531ca', 'Support'),
	('692da80d-3e73-4f28-977d-14ebd1564209', 'Surveillance'),
	('f2c1bed7-7b0e-4742-b8fc-841ce23123a1', 'Systems Engineering'),
	('c616087c-5a48-497b-92d8-1e862cd10bc8', 'Talent Acquisition'),
	('0d27ef59-50a5-469c-9d8c-0677451f6200', 'Teaching'),
	('832a3967-9932-49ed-9d24-a258b8a53a79', 'Teaching and Learning'),
	('5c7afc03-1856-459e-8f16-7eb42eace090', 'Technical Support'),
	('0be3b44f-5855-406d-80d0-4551006b1c31', 'Teletherapy'),
	('7ba1a37a-9dcb-47bd-a9b5-711e8783e2a6', 'Therapy Delivery'),
	('876f7f6a-7b37-4132-bee3-d5d13576e16d', 'Training'),
	('03db4d0b-92a0-471d-803e-6e3cb9b20cec', 'Training and Development'),
	('d126f1f4-f993-4c76-ae67-ac2061abe025', 'Training and Education'),
	('0bbcb462-72eb-4cab-80a4-5947d03ae6ef', 'Training and Skill Development'),
	('6bd563cc-230f-47fe-9878-67cec5ab1d84', 'Translation Services'),
	('ebfed77e-3db7-4a01-b5e6-ba807ea71dd7', 'User Experience'),
	('bade8997-a23e-4408-a2f4-c68052b293b9', 'User Experience Design'),
	('54fa765a-4deb-404d-b824-54430ca82097', 'User Safety'),
	('f3fd2575-808d-4d2d-b431-8c39f73b644c', 'Veterinary Services'),
	('132b6c69-bb6a-432d-a9d0-dfbdac5099d6', 'Wildlife Management'),
	('9fc530b0-69f2-4210-91b3-5c234d0b4130', 'Sales Automation'),
	('ba406429-e42c-40f5-8d1b-43699aca21ee', 'Special Education'),
	('8bb3de59-aa5f-46f6-8240-b52cf515a5e5', 'Child Psychology'),
	('8b37684e-450a-4ca9-97d3-d9373966683b', 'Healthcare Support Services'),
	('bf6e4b8c-98af-48f5-9910-be19e7647412', 'Algorithm Development'),
	('fac59fa6-6082-4d83-88a6-f33510ea24d1', 'Traffic Management'),
	('b39601e2-af65-4ba4-85ee-ca3c5e1d1653', 'Editorial Process'),
	('002b3e40-d18c-4bde-aa84-a71d7cd5ea89', 'Content Validation'),
	('ed51b3f7-0f07-49a0-a293-4ea6257cb42e', 'AI Strategy'),
	('4bd1c4f9-1f3d-4878-9590-ca0e03275c3f', 'Data Science'),
	('52dab89b-67d5-43f0-a794-e67169de04ea', 'Sustainability Initiatives'),
	('625ab53e-a90b-4058-b44c-16e84a73af42', 'Decision Support Systems'),
	('d0a80ef7-c1eb-46b8-a6e3-abfacf01dc69', 'Compliance and Regulatory Affairs'),
	('8816451e-9349-4b33-8dbc-7b31bff47b1c', 'Information Security'),
	('d6caa65b-bf1d-4776-8ea8-993f795ad165', 'Customer Support Automation'),
	('6a21054d-5d7f-424c-99ba-537d6fd4e91b', 'Environmental Compliance'),
	('5fc29beb-5946-487a-813f-fd9906904c66', 'Emergency Response Coordination'),
	('45918b27-9e00-4933-ba54-619e139fda90', 'R&D in Environmental Technologies'),
	('d4e41b14-768a-4298-88ee-348fb3a8965b', 'Healthcare IT'),
	('12138512-8030-4142-adfb-7ebabedd29a2', 'Administrative Processes'),
	('505ee659-cca5-41e0-8bdc-655e0410c960', 'Security Operations Center'),
	('64a23876-396c-4bcd-acbf-939c8ae906b1', 'Network Analysis'),
	('04472351-3a79-4873-815b-bc43c3d96fcf', 'Incident Response'),
	('9b06e8f2-0c59-47ea-87a4-58e2e9b0a6d2', 'Threat Hunting'),
	('ab5e3445-e5b0-47fb-a601-afde80c19271', 'Policy Making'),
	('449ebf27-edfc-43ac-840c-8a5e26fbd597', 'Inspection'),
	('3737eff5-3d5c-457a-a570-8b645b1f7c2c', 'Patient Engagement'),
	('c4bb2a32-fc9c-43d2-a3bf-ae23f069657f', 'Healthcare Consulting'),
	('030f9c0b-e663-405c-b4da-99e238a39cfb', 'Life Planning Services'),
	('613cac57-8aa3-4c92-ba2e-bffc8638a58e', 'Customer Segmentation'),
	('9201d2a4-0a4e-4302-ad7b-6c27a1ded0af', 'Risk Assessment');


--
-- Data for Name: smartjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."smartjects" ("id", "title", "mission", "problematics", "scope", "audience", "how_it_works", "architecture", "innovation", "use_case", "image_url", "created_at", "updated_at", "research_papers") VALUES
	('a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'AI-Powered Healthcare Assistant', 'To improve patient care through AI-driven diagnostics and treatment recommendations.', 'Healthcare professionals often face information overload and time constraints when diagnosing patients.', 'A comprehensive AI system that analyzes patient data, medical history, and symptoms to suggest potential diagnoses and treatment plans.', 'Healthcare providers, doctors, and medical institutions.', 'The system uses machine learning algorithms to analyze patient data and compare it with millions of medical records to identify patterns and suggest diagnoses.', 'Cloud-based architecture with secure API integrations to electronic health record systems.', 'Combines natural language processing with medical knowledge graphs for more accurate diagnostics.', 'A hospital implements the system to help doctors quickly identify rare conditions and reduce misdiagnoses.', 'https://api.dicebear.com/7.x/shapes/svg?seed=healthcare', '2025-05-17 20:13:03.93953+00', '2025-05-17 20:13:03.93953+00', '[]'),
	('b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'Blockchain Supply Chain Tracker', 'To increase transparency and traceability in global supply chains.', 'Supply chains are complex and often lack transparency, making it difficult to verify product authenticity and ethical sourcing.', 'A blockchain-based platform that tracks products from source to consumer, providing immutable records of each transaction and transfer.', 'Manufacturers, distributors, retailers, and consumers concerned about product authenticity and ethical sourcing.', 'Each product is assigned a unique digital identity that is updated at every stage of the supply chain, with all data stored on a blockchain.', 'Decentralized blockchain network with mobile and web interfaces for different stakeholders.', 'Uses smart contracts to automate compliance verification and payment processing between supply chain partners.', 'A coffee company uses the platform to prove fair trade practices and allow customers to trace their coffee beans back to the specific farm.', 'https://api.dicebear.com/7.x/shapes/svg?seed=blockchain', '2025-05-17 20:13:03.93953+00', '2025-05-17 20:13:03.93953+00', '[]'),
	('c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'Smart Retail Analytics Platform', 'To help retailers optimize store layouts and inventory based on customer behavior.', 'Retailers struggle to understand customer movement patterns and preferences in physical stores.', 'An IoT and AI-powered analytics platform that tracks customer movement, engagement with products, and purchase decisions.', 'Retail store owners, merchandising teams, and retail chain managers.', 'The system uses in-store sensors and cameras to anonymously track customer movements and interactions, then applies AI to generate insights.', 'Edge computing devices in stores connected to a central cloud platform for data aggregation and analysis.', 'Combines computer vision, heat mapping, and predictive analytics to forecast customer behavior and optimize store layouts.', 'A department store uses the platform to redesign its layout, resulting in a 15% increase in sales.', 'https://api.dicebear.com/7.x/shapes/svg?seed=retail', '2025-05-17 20:13:03.93953+00', '2025-05-17 20:13:03.93953+00', '[]'),
	('d3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', 'Automated Financial Advisor', 'To democratize access to personalized financial advice through AI.', 'Quality financial advice is often only available to wealthy individuals, leaving many people without guidance for important financial decisions.', 'An AI-powered platform that provides personalized financial advice based on individual goals, income, spending habits, and risk tolerance.', 'Individuals seeking financial guidance, particularly young professionals and those with limited access to traditional financial advisors.', 'The system analyzes user financial data, market trends, and economic indicators to generate personalized investment strategies and savings plans.', 'Secure cloud platform with bank-level encryption and API connections to financial institutions.', 'Uses reinforcement learning to continuously improve investment strategies based on market performance and user feedback.', 'A young professional uses the platform to create a retirement savings plan and investment strategy tailored to their goals and risk tolerance.', 'https://api.dicebear.com/7.x/shapes/svg?seed=finance', '2025-05-17 20:13:03.93953+00', '2025-05-17 20:13:03.93953+00', '[]'),
	('e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', 'Virtual Classroom Environment', 'To create immersive, engaging virtual learning experiences that rival in-person education.', 'Remote education often lacks the engagement and interactivity of in-person learning environments.', 'A virtual reality platform that creates immersive classroom environments where students and teachers can interact as if physically present.', 'Educational institutions, teachers, and students participating in remote or hybrid learning.', 'The platform uses virtual reality to create 3D classroom environments where participants are represented by avatars and can interact with virtual learning materials.', 'Cloud-based VR platform with low-latency networking and content distribution systems.', 'Incorporates spatial audio, haptic feedback, and AI teaching assistants to enhance the learning experience.', 'A university implements the platform for distance learning programs, resulting in higher student engagement and improved learning outcomes.', 'https://api.dicebear.com/7.x/shapes/svg?seed=education', '2025-05-17 20:13:03.93953+00', '2025-05-17 20:13:03.93953+00', '[]'),
	('e099c354-1819-4130-8482-57b240b814e2', 'Deeper insights into retrieval augmented generation: The role of sufficient context', 'To enhance large language models (LLMs) by integrating relevant external context, ensuring accurate answers or clear uncertainty. Address hallucination risks in retrieval augmented generation (RAG) systems. Develop a framework to measure context sufficiency, enabling reliable factual outputs. Improve RAG system performance through rigorous analysis of context quality and its impact on accuracy. Provide practical tools like the LLM Re-Ranker to optimize retrieval metrics and user outcomes.', 'RAG systems often produce hallucinated information, misleading users with incorrect answers. Prior research focused on contextual relevance to queries rather than assessing if the context provides enough information for accurate responses. This narrow focus overlooks critical gaps in data that prevent correct answers. Existing approaches fail to quantify context sufficiency, making it hard to debug failures or improve system reliability. The lack of a clear metric for sufficiency hinders progress in deploying RAG systems for high-stakes applications.', 'The study investigates the concept of ''sufficient context'' in RAG systems, defining when an LLM has enough information to answer a question accurately. It quantifies context sufficiency, enabling analysis of factors affecting RAG performance. The research introduces tools like the LLM Re-Ranker to refine retrieved snippets, improving retrieval metrics and system accuracy. It bridges theoretical insights with practical deployment, offering scalable solutions for real-world applications of RAG.', 'Researchers and developers in natural language processing (NLP) and AI, practitioners building RAG systems for enterprise or academic use, data scientists focused on improving LLM accuracy, and organizations requiring reliable question-answering solutions. The work is relevant to fields where contextual completeness is critical, such as customer support, legal analysis, and scientific research.', 'The system retrieves context from diverse sources like documents or knowledge graphs. It evaluates whether this context is sufficient for the LLM to generate accurate answers, avoiding hallucinations. The ''sufficient context'' metric quantifies this adequacy, guiding the RAG process. The LLM Re-Ranker reorders retrieved snippets by relevance, enhancing retrieval efficiency and output quality. This approach ensures the model either answers correctly or explicitly states uncertainty, improving trust and reliability in RAG systems.', 'A modular pipeline integrates retrieval, sufficiency evaluation, and generation. The retrieval stage gathers context from external sources. The sufficiency evaluation module quantifies whether the context meets the required threshold for accurate answers. The generation stage uses the LLM to produce responses, leveraging the refined context. The Vertex AI RAG Engine incorporates the LLM Re-Ranker, which optimizes retrieved snippets for relevance, enhancing metrics like nDCG and overall system accuracy.', 'Introduces ''sufficient context'' as a novel metric, shifting focus from relevance to information adequacy. Develops a quantitative framework to assess context sufficiency, enabling precise analysis of RAG performance. Integrates the LLM Re-Ranker to dynamically prioritize context snippets, improving retrieval efficiency. Applies these insights to real-world systems like Vertex AI, demonstrating scalable improvements in accuracy and reliability. Offers a new lens for debugging and optimizing RAG systems across diverse applications.', 'In customer support, RAG systems powered by sufficient context provide accurate answers to complex queries, reducing errors. In legal analysis, they ensure reliable interpretation of case law and documents. For scientific research, they enable precise question-answering from vast datasets. The LLM Re-Ranker enhances these use cases by refining context retrieval, improving metrics like nDCG and reducing hallucination risks. This approach is critical in high-stakes environments where incorrect answers could have significant consequences.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/SufficientContext1_Hero.png', '2025-05-19 21:04:09.509835+00', '2025-05-19 21:04:09.509835+00', '[]'),
	('9187e65a-d9c5-4d8c-ab78-1c5859223998', 'Bringing 3D shoppable products online with generative AI', 'To revolutionize online shopping by enabling interactive 3D product visualizations through generative AI, enhancing customer experience and reducing return rates. Our mission is to scale 3D product generation for e-commerce platforms, making shoppable 360° views accessible for a wide range of products. By leveraging view-conditioned diffusion models, we aim to bridge the gap between 2D images and immersive 3D experiences. This initiative supports retailers in offering more engaging product displays while improving conversion rates and customer satisfaction. The technology enables seamless integration of 3D assets into digital marketplaces, transforming how consumers interact with products online. We focus on creating scalable solutions that balance realism, efficiency, and accessibility for global e-commerce operations. Our long-term vision is to standardize 3D product representation across industries, fostering innovation in digital commerce. By addressing technical and logistical challenges, we empower businesses to adopt advanced visualization tools without requiring extensive resources. This mission aligns with the growing demand for immersive and personalized shopping experiences in the digital age.', 'Traditional 3D product modeling is time-consuming, expensive, and requires specialized expertise, limiting its adoption in e-commerce. Existing methods often rely on limited viewpoint images, making it difficult to generate realistic 3D representations from sparse data. The lack of scalable solutions hinders the integration of 3D assets into online marketplaces, forcing retailers to rely on static 2D images with limited interactivity. Current approaches struggle to maintain consistency and realism across different viewpoints, leading to subpar user experiences. The computational complexity of generating high-quality 30 models also poses challenges for real-time applications and large-scale deployments. Additionally, the absence of standardized workflows for 3D product creation creates barriers for businesses seeking to adopt this technology. The need for efficient training methods and robust generalization capabilities further complicates the development of scalable 3D generation systems. These limitations highlight the necessity for innovative approaches that combine generative AI with efficient training strategies to enable practical, widespread adoption of 3D shoppable products.', 'The scope encompasses the development and deployment of view-conditioned diffusion models for generating 3D product representations from limited 2D input. It includes optimizing training processes using score distillation sampling to improve model efficiency and realism. The initiative focuses on integrating these models into e-commerce platforms like Google Shopping, enabling interactive 360° visualizations for footwear and other product categories. It addresses challenges related to scalability, computational resources, and real-time generation for high-traffic digital marketplaces. The scope also involves refining the accuracy of viewpoint prediction and ensuring compatibility with existing e-commerce infrastructure. Additionally, it covers the expansion of supported product types beyond footwear to other categories, enhancing the versatility of the technology. The project aims to standardize workflows for 3D product creation, reducing the dependency on specialized 3D modeling expertise. It also involves collaboration with retailers and platform providers to ensure seamless integration and user adoption. Finally, the scope extends to exploring potential applications in other industries requiring 3D visualization capabilities.', 'The primary audience includes e-commerce retailers and platform providers seeking to enhance their product listings with 3D visualizations. Consumers benefit from improved shopping experiences through interactive 360° views, enabling better product understanding and decision-making. Digital marketers and advertisers leverage these 3D assets for more engaging promotional content and targeted campaigns. Product designers and developers use the technology to create and refine 3D models efficiently, reducing reliance on traditional 3D modeling tools. Retailers with limited resources benefit from scalable solutions that minimize the need for specialized expertise or high upfront costs. Businesses in industries like fashion, footwear, and accessories stand to gain from realistic 3D representations that reduce return rates and improve customer satisfaction. Platform developers and integrators play a key role in embedding these capabilities into existing e-commerce systems. Additionally, researchers and AI engineers contribute to advancing the underlying generative models and training methodologies. The technology also appeals to users in industries requiring immersive visualization, such as virtual try-on applications and augmented reality experiences.', 'The system uses a view-conditioned diffusion model trained with score distillation sampling to generate 3D product representations. During training, a 3D model is rendered from a random camera view, and the model generates a target image from the same viewpoint using available posed images. The difference between the rendered image and the generated target is calculated as a score, which guides the optimization of the 3D model''s parameters. This iterative process refines the model''s accuracy and realism, enabling it to predict how a product would look from any viewpoint based on limited input. For a given product, users can provide a single image of a specific viewpoint, such as the top of a shoe, and the model will infer and generate the appearance from other angles. The training process leverages existing 3D models and synthetic data to improve generalization capabilities, ensuring the model can handle diverse product types and viewpoints. The system scales efficiently by optimizing computational resources, allowing it to generate 3D representations for thousands of products daily. The final output is integrated into e-commerce platforms, enabling interactive 360° visualizations that enhance user engagement and product understanding.', 'The architecture comprises a modular pipeline integrating generative AI models with e-commerce infrastructure. At its core is the view-conditioned diffusion model, trained using score distillation sampling to refine 3D representations. The training process involves rendering 3D models from random camera angles and comparing generated outputs to target images, optimizing parameters through iterative feedback. A data pipeline ingests 2D images and 3D models, feeding them into the diffusion model for processing. The system uses synthetic data and real-world examples to enhance model generalization, ensuring adaptability to various product types. For deployment, the model is integrated into e-commerce platforms, where it generates 360° visualizations in real time based on user interactions. The architecture includes a scalable backend for handling high-volume requests, ensuring efficient resource allocation and low latency. Cloud-based infrastructure supports distributed training and inference, enabling rapid scaling for global platforms like Google Shopping. The system also incorporates quality checks and validation mechanisms to ensure the accuracy and consistency of generated 3D models. Finally, the architecture includes APIs for seamless integration with existing e-commerce workflows, allowing retailers to leverage the technology without extensive modifications.', 'The innovation lies in combining view-conditioned diffusion models with score distillation sampling to achieve scalable and realistic 3D product generation. By conditioning the diffusion process on specific viewpoints, the model can infer and generate 3D representations from limited input, overcoming the need for extensive 2D image datasets. This approach significantly reduces the computational complexity of training, enabling efficient large-scale deployment. The integration of score distillation sampling allows the model to learn from both 3D models and 2D images, improving generalization and realism. The innovation also addresses the challenge of viewpoint consistency, ensuring generated 3D models maintain visual accuracy across different angles. The ability to generate 360° visualizations from a single input image transforms how products are presented online, enhancing user engagement and reducing return rates. The system''s scalability is further enhanced by optimizing training and inference processes, making it feasible for high-traffic e-commerce platforms. This breakthrough in generative AI enables businesses to adopt advanced visualization tools without requiring specialized 3D modeling expertise, democratizing access to immersive shopping experiences. The innovation also opens possibilities for applications beyond e-commerce, such as virtual try-ons and augmented reality experiences.', 'In e-commerce, the technology enables interactive 360° visualizations for products like footwear, allowing customers to explore items from multiple angles before purchasing. Retailers can integrate these 3D models into their online stores, enhancing product displays and reducing return rates by providing a more accurate representation of the item. For example, shoppers can view sandals, heels, and boots from various perspectives, making informed purchasing decisions. The system supports real-time generation of 3D models, enabling seamless integration into digital marketplaces like Google Shopping. This use case benefits businesses by improving customer satisfaction and conversion rates while reducing the need for physical inventory. The technology also supports personalized shopping experiences, where users can customize product views based on their preferences. Additionally, it enables retailers to showcase products in virtual try-on environments, expanding their reach to new markets. The scalability of the solution allows for rapid deployment across multiple product categories, ensuring consistent quality and performance. This use case demonstrates how generative AI can transform traditional e-commerce by introducing immersive and interactive shopping experiences.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/Maya3_SecondGen.png', '2025-05-19 21:10:32.727111+00', '2025-05-19 21:10:32.727111+00', '[]'),
	('22b2a417-12d1-4ba7-bbee-0b770c0c3933', 'Making complex text understandable: Minimally-lossy text simplification with Gemini', 'To empower users to understand complex text by creating a simplified version that retains the original meaning, detail, and nuance without sacrificing integrity.', 'Complex text often acts as a barrier for non-experts who need to access critical information in fields like healthcare, legal, and finance. Traditional summarization tools may omit key details or introduce errors, while explanation tools can add unnecessary information.', 'This project introduces a high-fidelity text simplification system using Gemini models, designed to maintain the integrity of complex texts while making them more accessible. The system is also launched as a new feature in the Google app for iOS called Simplify.', 'The audience includes researchers, data scientists, everyday users, healthcare professionals, legal experts, and financial users who encounter complex text in their daily lives or work.', 'The system uses Gemini models to paraphrase complex ideas accurately, maintaining the original meaning. It employs an automated evaluation and iterative prompt refinement loop to discover effective prompts for high-fidelity simplification, enabling precise and error-free rewriting.', 'The architecture features a modular pipeline with an automated evaluation loop that iteratively refines prompts, allowing Gemini models to achieve optimal performance in text simplification.', 'This work represents the first combination of minimally-lossy text simplification with precise prompt optimization, enabling a new level of accuracy and effectiveness in creating accessible versions of complex texts.', 'The simplified text can help users understand challenging material across various domains, such as health information, legal documents, and financial details, thereby reducing cognitive load and empowering users to engage with critical information.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/Simplify1_SummaryHero.png', '2025-05-19 21:36:00.687386+00', '2025-05-19 21:36:00.687386+00', '[]'),
	('b762b8cb-0376-459a-a1d4-70df231c3526', 'Amplify Initiative: Localized data for globalized AI', 'To ensure generative AI models can address critical local needs by collecting diverse, high-quality data representing people, their needs, and values from across the globe in their own languages, while ensuring responsible and respectful data collection practices.', 'Generative AI models currently suffer from limited training data in terms of languages, topics, and geographies, restricting their global reach. Additionally, there is a need for localized and culturally relevant solutions to address specific needs such as accessible health information, culturally tailored education curricula, and financial services. Collecting data without respecting local contexts and preferences can lead to biases and misrepresentations.', 'The Amplify Initiative aims to build an open, community-based data platform that enables scalable data collection and validation globally. It focuses on co-creating datasets with domain experts through pilot projects, such as one conducted in Sub-Saharan Africa using an Android app. This research resulted in an annotated dataset of 8,091 adversarial queries in seven languages authored collaboratively with 155 experts. The initiative plans to expand its methodology to Brazil and India to identify innovative methods for capturing knowledge not currently available online.', 'AI researchers, data scientists, educators, policymakers, and community leaders working on AI development and data collection efforts.', 'The system employs a collaborative approach where domain experts co-author datasets with the help of an Android app. This results in annotated datasets that reflect local contexts and are available in multiple languages. The methodology emphasizes community engagement and responsible data practices to ensure cultural relevance and reduce biases.', 'The architecture includes community engagement tools, data validation processes, integration modules for various platforms, and an analytics layer to monitor and assess dataset performance metrics.', 'Amplify Initiative represents a novel approach by prioritizing localized, community-driven data collection methods that emphasize cultural relevance and responsible practices. It is the first initiative of its kind focused on creating datasets tailored to the needs of underrepresented communities in low-resource areas.', 'Use cases include providing accessible health information in local languages, developing culturally relevant curricula for education, and creating localized financial services solutions that meet specific community needs.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/Amplify_Preview.png', '2025-05-19 21:40:40.439609+00', '2025-05-19 21:40:40.439609+00', '[]'),
	('5f9fc413-d318-4dfe-8da2-3cea5230260a', 'Building AI for the Pluralistic Society', 'To establish a framework that respects and integrates diverse perspectives into AI systems, ensuring they reflect the pluralistic nature of our society.', 'Current AI models often overlook the diversity of human perspectives, leading to biased outcomes and marginalization of minority viewpoints.', 'The project aims to develop methods for capturing and integrating diverse social perspectives across different demographic groups into machine learning models.', 'Researchers, data scientists, ethicists, and AI developers working on ethical AI development.', 'The system captures varying human perspectives during data collection, incorporates them into training processes, and evaluates their impact on model performance across diverse social groups.', 'A modular pipeline that includes components for perspective capture, analysis, and integration, ensuring scalability and adaptability to different contexts.', 'First work to combine qualitative methods with machine learning techniques to create pluralistic AI models that respect and reflect diverse societal values.', 'Applying to tasks where subjective human judgment is involved, such as determining appropriate responses in multilingual settings or evaluating offensive content across cultural contexts.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/PluralisticAI-1-Objectives.png', '2025-05-22 22:55:35.549509+00', '2025-05-22 22:55:35.549509+00', '[]'),
	('f45fc70e-9d1e-4434-8478-e78a5ee07882', 'AMIE gains vision: A research AI agent for multimodal diagnostic dialogue', 'To enhance diagnostic conversations by integrating multimodal information and improving accuracy through visual data processing.', 'Current AI systems lack the ability to effectively process and utilize multimodal data in real-time during clinical dialogues, which is crucial for accurate diagnosis.', 'The research focuses on developing an AI system capable of requesting, interpreting, and reasoning about visual medical information. It uses the Gemini 2.0 Flash as a core component and adapts responses based on conversation phases and uncertainty levels.', 'Researchers in healthcare AI, primary care physicians, medical educators, and patients who benefit from improved diagnostic accuracy via multimodal data integration.', 'AMIE utilizes the Gemini 2.0 Flash model to process multimodal data, such as images and documents, within a clinical conversation. It adapts its approach based on conversation phases and the level of uncertainty in diagnosis, making history-taking more effective.', 'A modular pipeline with components for uncertainty detection, response optimization, and integration with external tools like EHR systems for accessing patient data.', 'This research is innovative as it combines large language models with multimodal reasoning specifically for medical consultations, addressing a gap in integrating visual data into diagnostic processes.', 'Evaluating AMIE against primary care physicians using OSCEs. Preliminary experiments with Gemini 2.5 Flash show potential improvements, indicating scalability and integration of the latest models.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/MMAMIE-1still.png', '2025-05-19 21:45:23.526943+00', '2025-05-19 21:45:23.526943+00', '[]'),
	('22c36698-1ea9-44d8-869c-32fcd6bbd52c', 'Benchmarking LLMs for global health', 'To evaluate and optimize large language models (LLMs) for healthcare applications, focusing on their utility across various global health contexts.', 'Despite success in existing medical benchmarks, LLMs show variability in performance across regions, symptoms, languages, and cultural contexts, particularly concerning tropical and infectious diseases (TRINDs).', 'Developing novel evaluation tools and methodologies for assessing LLM performance on out-of-distribution disease subgroups, such as TRINDs, using synthetic personas and benchmarking frameworks.', 'Healthcare professionals, researchers, data scientists, public health officials, and policymakers involved in global health initiatives.', 'The system employs synthetic personas representing diverse scenarios across demographics, clinical contexts, locations, languages, and consumer augmentations to evaluate LLM performance.', 'A modular framework combining domain-specific knowledge with advanced AI techniques to optimize model performance.', 'First comprehensive work integrating multimodal medical AI with large language models for global health applications, addressing distribution shifts in disease types and contextual variations.', 'Enhancing clinical decision support systems and community-level health training, particularly for low-resource settings and tropical and infectious diseases.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/TRINDs2_PyramidHero.png', '2025-05-22 17:47:36.382958+00', '2025-05-22 17:47:36.382958+00', '[{"url": "https://research.google/blog/benchmarking-llms-for-global-health/", "title": "Generative AI for Health and Advances in Medical Foundation Models"}]'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', 'Introducing Mobility AI: Advancing urban transportation', 'To enhance urban transportation systems by leveraging advanced AI techniques to analyze and improve mobility patterns, congestion management, parking insights, and travel demand estimation.', 'Current methods for analyzing mobility and congestion often rely on limited or siloed data sources, lack scalability, and may not fully capture the complexities of urban transportation networks. Traditional approaches can be data-intensive and may not effectively utilize machine learning for comprehensive analysis.', 'The scope encompasses developing AI-driven models to address congestion, optimize parking management, estimate origin-destination travel patterns, and evaluate the environmental and safety impacts of transportation policies. The work focuses on creating scalable solutions that can handle real-time and historical data across urban areas.', 'Transportation authorities, urban planners, policymakers, researchers, and mobility optimization professionals who are interested in leveraging AI for better decision-making in urban transportation.', 'Mobility AI utilizes machine learning to analyze real-time and historical data from various sources. It creates city-wide models using self-supervised learning techniques to capture geospatial patterns and movement trends. These models enable robust predictions for congestion, parking availability, and travel demand estimation. The system collaborates with Google Research initiatives to leverage generative AI and foundation models for advanced analysis.', 'The architecture is modular, designed to handle multiple aspects of urban transportation including congestion modeling, parking prediction, and origin-destination analysis. It employs a combination of machine learning algorithms and statistical techniques to process and interpret data effectively.', 'Mobility AI represents a significant innovation by integrating machine learning with geospatial understanding to create comprehensive models that can analyze limited data sources and provide actionable insights for optimizing urban transportation networks. This work is among the first to combine these advanced techniques to address complex mobility challenges.', 'The system is utilized for managing parking availability, predicting congestion levels, estimating origin-destination travel demand, and evaluating the impact of transportation policies on safety, emissions, and overall network performance. It supports decision-making processes for transportation authorities and urban planners.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/MobilityAI1_Cover.png', '2025-05-22 17:51:43.344528+00', '2025-05-22 17:51:43.344528+00', '[]'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', 'InstructPipe: Generating Visual Blocks Pipelines with Human Instructions and LLMs', 'To accelerate machine learning prototyping by providing interactive tools that facilitate rapid creation of AI pipelines through visual programming.', 'Novice users find it challenging to set up and link appropriate nodes from a blank workspace without guidance, which can hinder the efficient development of machine learning pipelines.', 'The project focuses on developing InstructPipe as an AI assistant for creating machine learning pipelines with text instructions, using three modules: two large language model (LLM) modules and a code interpreter that renders the pipeline in a visual editor for human-AI collaboration.', 'Researchers, Data Scientists, Software Developers, AI Enthusiasts, and any user needing to prototype machine learning models efficiently.', 'InstructPipe uses text instructions to generate pseudocode for a target pipeline. The generated pseudocode is then rendered into a visual editor, allowing users to build node-graph diagrams (pipelines). This facilitates human-AI collaboration, streamlining the workflow and reducing the learning curve.', 'The architecture consists of three main modules: two large language model (LLM) modules that generate pseudocode for the pipeline and a code interpreter module that converts this pseudocode into a visual programming interface. The system is designed to be user-friendly, allowing for interactive prototyping of machine learning models.', 'This work represents the first combination of human instructions with large language models (LLMs) to automate the creation of machine learning pipelines in a visual environment. It breaks down barriers between technical and non-technical users by providing an accessible interface for building complex AI models.', 'A real-world application could involve enabling data scientists without extensive coding experience to prototype sophisticated machine learning models quickly, leading to faster innovation cycles and more iterative development in various domains such as healthcare, finance, and retail.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/InstructPipe2_Overview_copy.png', '2025-05-22 17:56:52.434101+00', '2025-05-22 17:56:52.434101+00', '[]'),
	('b183ac06-c543-4af1-80e2-0a2adfadbd92', 'Differential Privacy on Trust Graphs', 'To establish a robust and scalable framework that integrates differential privacy with trust dynamics to enable secure, context-aware data sharing among users with varying levels of trust.', 'Current differentially private models often assume binary trust relationships between users, failing to account for the nuanced privacy preferences that individuals have based on their relationships. This limitation can lead to overly restrictive or incomplete privacy protections in real-world scenarios where users may share data with some parties but not others.', 'The project will focus on developing a novel framework called Trust Graph Differential Privacy (TGDP) that applies differential privacy principles to trust graphs, ensuring that the distribution of messages exchanged between users and their trusted neighbors remains statistically indistinguishable from the original data even if individual user data changes. The scope includes designing mechanisms to handle varying levels of trust and asymmetric privacy requirements in a mathematically rigorous manner.', 'Researchers, Data Scientists, Data Privacy Experts, Developers, Industry Professionals in Healthcare, Finance, Education, and other sectors requiring secure data sharing with nuanced privacy preferences.', 'The system ingests trust graphs where vertices represent users and edges indicate the level of trust between them. It then applies differential privacy techniques to messages exchanged between users based on their trust relationships. The approach ensures that the privacy guarantee holds even if the input data of a user changes, while allowing for tailored privacy policies based on individual trust networks.', 'A modular pipeline with components for parsing trust graphs, applying differential privacy algorithms, and enforcing privacy constraints. The architecture includes mechanisms to model varying levels of trust and ensure that messages shared between trusted users are protected without compromising the privacy of untrusted parties.', 'This work represents a first-of-its-kind integration of differential privacy with trust graphs, allowing for more nuanced and context-aware privacy policies. By modeling trust relationships explicitly, the framework addresses the limitations of traditional differentially private models that rely on binary trust assumptions.', 'In healthcare data sharing, patients can share their data with trusted providers while maintaining privacy through differential privacy mechanisms. In finance, users can securely share sensitive information with trusted partners without risking privacy breaches. location data sharing can be controlled based on family or friend relationships, ensuring privacy while enabling valuable data collaboration.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/DPTrustGraph1_ExampleHero.png', '2025-05-22 22:14:12.938996+00', '2025-05-22 22:14:12.938996+00', '[]'),
	('43d93874-f4ea-415e-9e02-8c540df80af1', 'Teaching machines the language of biology: Scaling large language models for next-generation single-cell analysis', 'To enable machines to interpret and describe complex biological information at the single-cell level, transforming how we study, diagnose, and treat disease.', 'Single-cell data is high-dimensional, difficult to analyze without specialized tools, and currently limited to expert users.', 'This project aims to develop open-source large language models that can translate single-cell gene expression data into understandable text descriptions for broader scientific use.', 'Researchers and data scientists in biology, healthcare, and related fields working with single-cell data.', 'Single-cell RNA sequencing (scRNA-seq) generates massive datasets. The Cell2Sentence-Scale (C2S-Scale) models convert these into text descriptions that humans can understand, enabling analysis through language.', 'A modular framework using advanced large language models trained specifically for single-cell data interpretation.', 'First application of large language models to single-cell biological data, bridging the gap between computational and biological understanding.', 'Analyzing cell behavior, responding to drugs or diseases, aiding in disease diagnosis, and enhancing tissue-level studies.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/CellToSent1_HEROFinal.png', '2025-05-22 22:18:39.709059+00', '2025-05-22 22:18:39.709059+00', '[]'),
	('469065e3-22a3-4ce8-a5da-51cdf23c4b0c', 'Geospatial Reasoning: Unlocking insights with generative AI and multiple foundation models', 'To unlock insights from geospatial data by leveraging generative AI and multiple foundation models, Google Research focuses on transforming complex geospatial information into actionable and understandable outcomes.', 'Geospatial data can be vast, complex, and challenging to process. Current AI methods are not optimized for geospatial problems, and gathering, storing, and serving this data requires specialized tools and expertise. The integration of diverse data types (like weather, maps, and images) is often time-consuming and resource-intensive.', 'The project aims to accelerate the use of geospatial information in various domains by developing real-time services and AI models that enhance existing proprietary systems. It focuses on creating tools that can process and analyze geospatial data efficiently, enabling advanced insights and decision-making.', 'This solution is designed for organizations across industries such as public health, urban development, integrated business planning, and climate resilience. Researchers and data scientists working on geospatial problems also benefit from the innovative approaches developed by this initiative.', 'The system uses pre-trained foundation models, such as the Population Dynamics Foundation Model (PDFM) and a mobility-focused model, to handle complex geospatial tasks. Generative AI, like large language models (LLMs), is integrated into workflows to manage data interactions through natural language. This approach reduces costs and enhances efficiency in processing geospatial information.', 'A modular pipeline integrates the foundation models with generative AI, allowing for flexible and scalable solutions. The system is designed to handle various geospatial datasets and combines this information to create comprehensive insights. It leverages cloud computing for storage and processing, ensuring accessibility and scalability.', 'The innovation lies in combining multiple foundation models with generative AI to create a unified system that can address diverse geospatial challenges. This approach enables the creation of agentic workflows that interact effectively with geospatial data, producing surprising and valuable insights.', 'Use cases include optimizing routes using real-time data, enhancing urban planning through spatial analysis, and improving climate resilience by modeling environmental changes. The system also supports the integration of multiple data types to provide a more holistic view of geographic information.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/GeospatialReasoning1_OverviewHERO.png', '2025-05-22 22:22:34.110337+00', '2025-05-22 22:22:34.110337+00', '[]'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', 'The evolution of graph learning', 'To develop innovative tools and frameworks for analyzing and modeling graph-based data across diverse domains.', 'Before Euler''s work, there was no systematic approach to understanding the complex relationships in real-world systems, making it difficult for non-specialists to leverage graph theory effectively.', 'The project will create educational resources and tools that make graph concepts accessible while applying them across various industries like healthcare, finance, retail, manufacturing, education, etc., using AI and machine learning to analyze complex networks.', 'Researchers, data scientists, professionals in network analysis, educators, and students interested in graph theory and its applications.', 'The system uses AI and ML algorithms to automatically analyze graph structures, identify patterns, and visualize them through interactive tools, handling large datasets for real-time insights into relationships and connections.', 'A modular pipeline with components for data processing, pattern recognition, and visualization, leveraging cloud-based solutions and APIs for scalability and data integration from various sources.', 'First work to combine graph theory with AI/ML techniques to automate analysis and modeling, providing deeper insights into complex systems beyond traditional methods.', 'Applications include social network analysis in healthcare (e.g., patient care networks), fraud detection in finance, supply chain optimization in manufacturing, and other areas helping organizations understand their connections better.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/GraphLearningHERO.png', '2025-05-22 22:27:20.328486+00', '2025-05-22 22:27:20.328486+00', '[]'),
	('7a572550-5dee-41e2-b329-dba4338ddbec', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', 'To enhance healthcare outcomes by developing AI systems capable of advanced clinical reasoning and longitudinal disease management.', 'Current medical AI systems often lack the capability to effectively reason over time about disease progression, therapeutic responses, and safe medication prescription.', 'The project aims to develop an enhanced version of AMIE, integrating LLM capabilities optimized for clinical management reasoning and dialogue, enabling it to support patients and clinicians in navigating complex treatment sequences.', 'Physicians, nurses, healthcare providers, researchers interested in AI applications in medicine.', 'The system processes longitudinal patient data using advanced LLMs, generating structured treatment plans aligned with clinical guidelines and patient needs.', 'A modular pipeline incorporating state-of-the-art LLMs for context reasoning and guideline integration, enabling continuous updates and adaptive treatment recommendations.', 'First work to integrate large language models specifically for clinical management reasoning, advancing AI''s role in disease progression and therapeutic response analysis.', 'Supporting healthcare providers in managing patients with chronic or progressive conditions through longitudinal monitoring and evidence-based treatment adjustments.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/AMIEMx-0a-Hero.png', '2025-05-22 22:33:48.601649+00', '2025-05-22 22:33:48.601649+00', '[]'),
	('bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'Google Research at Google I/O 2025', 'To establish a robust framework for advanced technologies and share them with developers and communities to drive innovation.', 'Current challenges in bringing cutting-edge research from theory to practical applications, ensuring seamless collaboration across teams and integrating diverse technological approaches while maintaining high standards.', 'The project focuses on developing and showcasing innovative AI technologies such as Gemini and generative AI, providing tools that enhance creativity and efficiency for developers worldwide.', 'Tech enthusiasts, developers, communities, researchers, businesses, and organizations looking to leverage advanced AI solutions.', 'Google Research leverages a modular architecture with scalable frameworks, integrating research findings with product development teams through iterative testing and feedback loops to ensure practical implementation.', 'A distributed system with collaborative environments, allowing for the integration of diverse technologies while maintaining flexibility and scalability.', 'Innovation lies in combining breakthroughs from AI and computer science into real-world applications, such as Gemini''s multi-modal understanding and generative models that transform raw data into actionable insights.', 'Applications span various industries like healthcare (AI-driven diagnostics), finance (fraud detection systems), retail (personalized recommendations), education (adaptive learning tools), manufacturing (quality control systems), and more.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/GRatIO25-0-Hero.png', '2025-05-22 22:38:57.079692+00', '2025-05-22 22:38:57.079692+00', '[]'),
	('15e85de3-1eb2-4e85-89e5-e894b9801cdd', 'Generating synthetic data with differentially private LLM inference', 'To address challenges in generating synthetic data while maintaining differential privacy (DP) and computational efficiency, our research establishes methods that allow for a significant increase in generated data volume without compromising quality or privacy.', 'Current approaches to generating synthetic text with DP often face trade-offs between privacy preservation, computational efficiency, and the amount of data that can be produced. Previous work limited the data size due to these competing priorities.', 'This research focuses on overcoming limitations in differential privacy that restrict the volume of data generated during model inference. We address issues related to the privacy budget and computational efficiency to enable larger-scale synthetic data generation while maintaining quality.', 'Researchers and data scientists working on differential privacy, machine learning applications, and synthetic data generation.', 'We leverage next-token sampling in language models combined with a differentially private mechanism called the exponential mechanism. This mechanism samples tokens based on their scores, incorporating randomness to preserve privacy. We also introduce a public drafter model that uses synthetic text for predictions, minimizing privacy expenditure when possible.', 'Our approach involves token sampling algorithms aligned with standard language model processes, utilizing an efficient privacy analysis that reuses contexts rather than generating fresh batches of sensitive data for each token.', 'This work represents the first application of differential privacy mechanisms to large language model inference in a way that significantly increases the amount of synthetic data generated without compromising privacy or computational efficiency.', 'The method is particularly useful for applications requiring synthetic text generation where direct use of sensitive data is not feasible, such as in healthcare, finance, and other domains with strict privacy constraints.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/SynthData-0-Hero.png', '2025-05-22 22:47:43.067809+00', '2025-05-22 22:47:43.067809+00', '[]'),
	('0c672dd6-427a-40e1-9dcf-c004fb4f88bf', 'Discovering new words with confidential federated analytics', 'To advance data privacy and security by developing innovative analytics techniques that preserve user confidentiality through federated computations.', 'Current federated analytics solutions often lack transparency in how data is aggregated, leading to diminished trust in data handling practices among users.', 'This project focuses on enhancing privacy-preserving analytics by leveraging confidential computing technologies and trusted execution environments (TEEs), ensuring that only authorized analyses are performed on local data without exposing individual user information.', 'Data scientists, researchers, developers, and privacy advocates who prioritize user data confidentiality in decentralized applications.', 'Confidential federated analytics employs trusted execution environments embedded in modern CPUs to execute specific, authorized analyses on locally stored data. Raw data remains encrypted and inaccessible except for the designated computations, ensuring that no unauthorized access or manipulation of sensitive information occurs.', 'The architecture utilizes TEEs to enforce data confidentiality, enabling secure aggregation of results while keeping raw data strictly local. This setup allows organizations to transparently inspect privacy properties of their data processing without compromising user privacy.', 'This approach represents a significant advancement in privacy-preserving computation by providing unprecedented transparency into how data is handled and ensuring that all privacy-relevant aspects are subject to rigorous checks and controls.', 'The technique can be applied across various industries, such as healthcare, finance, and manufacturing, where sensitive data must be analyzed without compromising individual privacy. For instance, it enables on-device intelligence features, keyboard modeling, and carbon emission estimation while maintaining strict data confidentiality.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/ConfidentialFederatedAnalytics-0-Hero.png', '2025-05-22 22:51:27.288641+00', '2025-05-22 22:51:27.288641+00', '[{"url": "https://example.com/federated-learning-paper", "title": "Federated Learning in Practice: Reflections and Projections"}]'),
	('9b2e4ca4-6a43-4f6b-8934-fd5fdcf88823', 'Urban mobility solutions: Calibrating digital twins at scale', 'To improve urban traffic management and planning through the development and calibration of high-resolution digital twin simulators that provide detailed insights into congestion patterns and transportation system performance.', 'Current methods for calibrating urban mobility simulators rely on costly and limited traditional sensors, leading to poor calibration accuracy. Traditional approaches often focus on small-scale networks, making them ineffective for large-scale metropolitan areas.', 'The project aims to create scalable, high-resolution digital twin models that accurately simulate congestion patterns across major cities. It integrates diverse factors such as on-demand transportation services and traveler behaviors to provide realistic traffic simulations. The goal is to enable better decision-making for urban planning and traffic management.', 'Urban planners, transportation engineers, policymakers, and researchers seeking to enhance traffic efficiency through data-driven solutions.', 'The system collects and analyzes traffic data from various sources, including ride-sharing apps and network operations. It models traveler behaviors and integrates these into digital twins that simulate different transportation scenarios for planning and testing.', 'A modular architecture using machine learning models to process and analyze data in real-time. The system includes modules for demand estimation, traffic simulation, and scenario analysis.', 'The first work to combine multi-city, high-resolution data sources for comprehensive traffic modeling. It integrates diverse transportation services and behaviors beyond traditional sensors.', 'Deploying electric-vehicle charging stations, mitigating post-event congestion, testing tolling systems, controlling traffic signals, and planning public transportation expansions.', 'https://storage.googleapis.com/gweb-research2023-media/original_images/UrbanMobility-0-Hero.gif', '2025-05-22 23:00:09.410166+00', '2025-05-22 23:00:09.410166+00', '[{"url": "https://research.google/blog/urban-mobility-solutions-calibrating-digital-twins-at-scale/", "title": "Traffic Simulations: Multi-City Calibration of Metropolitan Highway Networks"}]');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "email", "name", "avatar_url", "account_type", "created_at") VALUES
	('d9d046e5-67d7-4a05-b4e4-84f1f1e9149e', 'john.doe@example.com', 'John Doe', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', 'free', '2025-05-17 20:11:27.720317+00'),
	('c2c14c7a-5c23-4fc2-8b3d-3121d6d19f8c', 'jane.smith@example.com', 'Jane Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', 'paid', '2025-05-17 20:11:27.720317+00'),
	('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'michael.johnson@example.com', 'Michael Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael', 'free', '2025-05-17 20:11:27.720317+00'),
	('550e8400-e29b-41d4-a716-446655440000', 'emily.wilson@example.com', 'Emily Wilson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily', 'paid', '2025-05-17 20:11:27.720317+00'),
	('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'david.brown@example.com', 'David Brown', 'https://api.dicebear.com/7.x/avataaars/svg?seed=david', 'free', '2025-05-17 20:11:27.720317+00'),
	('f80838d7-5c01-4fb1-906d-6de22980b011', 'konstantin.tokareff@gmail.com', 'Konstantin Tokarev', NULL, 'paid', '2025-05-23 15:53:34.362653+00'),
	('2c1979f5-ca56-4d24-812c-1aadb8409e88', 'malya_tate@mail.ru', 'Test', NULL, 'paid', '2025-05-23 15:52:39.750205+00'),
	('dcc2a532-204e-41b5-a18d-cbeda22df213', 'andrpisarev@gmail.com', 'Andrei Pisarev', NULL, 'free', '2025-05-31 11:41:17.789407+00'),
	('ba1aef95-db05-4ecd-9cf6-1819fe7ee819', 'tumerkinaa@mail.ru', 'Tumerkina', NULL, 'paid', '2025-06-04 10:45:45.796986+00');


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."comments" ("id", "user_id", "smartject_id", "content", "created_at") VALUES
	('f1e2d3c4-b5a6-47f8-f9e0-d1c2b3a4f5e6', 'd9d046e5-67d7-4a05-b4e4-84f1f1e9149e', 'a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'This could revolutionize how doctors diagnose rare conditions. I''ve seen similar systems reduce diagnostic time by 30%.', '2025-05-14 20:16:51.395939+00'),
	('e2d3c4b5-a6f7-48e9-e0d1-c2b3a4f5e6d7', 'c2c14c7a-5c23-4fc2-8b3d-3121d6d19f8c', 'a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'How does this handle patient privacy concerns? Healthcare data is highly sensitive.', '2025-05-15 20:16:51.395939+00'),
	('d3c4b5a6-f7e8-49d0-d1c2-b3a4f5e6d7c8', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'We implemented a similar system for our agricultural products and saw customer trust increase significantly.', '2025-05-12 20:16:51.395939+00'),
	('c4b5a6f7-e8d9-40c1-c2b3-a4f5e6d7c8b9', '550e8400-e29b-41d4-a716-446655440000', 'b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'What''s the energy consumption like? Traditional blockchain solutions can be quite resource-intensive.', '2025-05-16 20:16:51.395939+00'),
	('b5a6f7e8-d9c0-41b2-b3a4-f5e6d7c8b9a0', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'Privacy concerns aside, this could be a game-changer for retail optimization. Our stores need this.', '2025-05-10 20:16:51.395939+00'),
	('a6f7e8d9-c0b1-42a3-a4f5-e6d7c8b9a0f1', 'd9d046e5-67d7-4a05-b4e4-84f1f1e9149e', 'c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'How accurate is the customer tracking in crowded environments?', '2025-05-13 20:16:51.395939+00'),
	('f7e8d9c0-b1a2-43f4-f5e6-d7c8b9a0f1e2', 'c2c14c7a-5c23-4fc2-8b3d-3121d6d19f8c', 'd3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', 'I''ve been using a similar service for a year and it''s completely changed how I manage my finances.', '2025-05-11 20:16:51.395939+00'),
	('e8d9c0b1-a2f3-44e5-e6d7-c8b9a0f1e2d3', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', 'How does this compare to traditional financial advisors in terms of performance?', '2025-05-15 20:16:51.395939+00'),
	('d9c0b1a2-f3e4-45d6-d7c8-b9a0f1e2d3c4', '550e8400-e29b-41d4-a716-446655440000', 'e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', 'This could be revolutionary for distance learning, especially for subjects that require hands-on experience.', '2025-05-09 20:16:51.395939+00'),
	('c0b1a2f3-e4d5-46c7-c8b9-a0f1e2d3c4b5', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', 'What kind of hardware requirements would students need to participate effectively?', '2025-05-14 20:16:51.395939+00'),
	('e0b9aafe-75a7-4bb4-aeb0-d98de5844a2b', 'f80838d7-5c01-4fb1-906d-6de22980b011', 'bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'hello', '2025-05-23 18:19:41.756985+00');


--
-- Data for Name: matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."matches" ("id", "smartject_id", "status", "matched_date", "provider_id", "needer_id", "updated_at") VALUES
	('a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', 'a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'in_negotiation', '2025-05-02 20:21:04.769076+00', NULL, NULL, '2025-06-04 10:52:27.081263+00'),
	('b2c3d4e5-f6a7-48b9-b0c1-d2e3f4a5b6c7', 'b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'new', '2025-04-17 20:21:04.769076+00', NULL, NULL, '2025-06-04 10:52:27.081263+00'),
	('c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8', 'e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', 'contract_signed', '2025-04-02 20:21:04.769076+00', NULL, NULL, '2025-06-04 10:52:27.081263+00'),
	('4daec3be-7779-45fe-a18d-c869cb14c221', '7a572550-5dee-41e2-b329-dba4338ddbec', 'contract_created', '2025-06-04 10:47:26.188843+00', '2c1979f5-ca56-4d24-812c-1aadb8409e88', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', '2025-06-04 10:54:32.953+00'),
	('dd19321a-754a-4c54-bfcd-1e56bcb7afe1', '7a572550-5dee-41e2-b329-dba4338ddbec', 'contract_created', '2025-06-04 11:05:26.226366+00', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', '2c1979f5-ca56-4d24-812c-1aadb8409e88', '2025-06-04 11:05:57.17+00'),
	('83fd7e18-337d-4635-9936-09fcef7ca7e4', '248c43c5-de9f-4904-9b64-697a180f1a58', 'contract_created', '2025-06-04 11:17:03.012223+00', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', '2c1979f5-ca56-4d24-812c-1aadb8409e88', '2025-06-04 11:17:16.915+00');


--
-- Data for Name: proposals; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."proposals" ("id", "user_id", "smartject_id", "type", "title", "description", "scope", "timeline", "budget", "deliverables", "requirements", "expertise", "approach", "team", "additional_info", "status", "created_at", "updated_at") VALUES
	('a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', '550e8400-e29b-41d4-a716-446655440000', 'a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'need', 'Implementation of AI Diagnostic Assistant for Regional Hospital Network', 'We are seeking a partner to implement an AI-powered diagnostic assistant across our network of 5 regional hospitals to improve diagnostic accuracy and reduce time to treatment.', 'Full implementation including data integration with our existing EHR system, model training, user interface development, and staff training.', '6 months', '$150,000', 'Data integration framework, Machine learning model, User interface, Documentation, Training program', 'Must comply with HIPAA regulations and integrate with Epic EHR system. Must achieve at least 90% diagnostic accuracy based on historical data.', NULL, NULL, NULL, 'We have a dataset of 50,000 anonymized patient records that can be used for training.', 'submitted', '2025-04-17 20:19:12.611094+00', '2025-04-22 20:19:12.611094+00'),
	('b2c3d4e5-f6a7-48b9-b0c1-d2e3f4a5b6c7', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'provide', 'AI Diagnostic Solution Implementation by MedTech Innovations', 'Our team specializes in healthcare AI solutions and can deliver a comprehensive diagnostic assistant tailored to your specific needs.', 'End-to-end implementation including data integration, model development, UI creation, and staff training.', '5 months', '$140,000', 'Custom AI model, Integration with EHR, Web and mobile interfaces, Comprehensive documentation, Training program', NULL, '10+ years of experience in healthcare AI with successful implementations at 12 major hospital systems.', 'We use a phased approach starting with data integration, followed by model development, testing, and deployment. We emphasize continuous feedback and iteration.', '1 Project Manager, 2 ML Engineers, 1 Healthcare Data Specialist, 2 UI/UX Developers, 1 Training Specialist', 'We have developed a proprietary algorithm that has shown 95% accuracy in similar implementations.', 'submitted', '2025-04-27 20:19:12.611094+00', '2025-04-27 20:19:12.611094+00'),
	('c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8', 'c2c14c7a-5c23-4fc2-8b3d-3121d6d19f8c', 'b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'need', 'Blockchain Traceability System for Organic Food Supply Chain', 'We are an organic food cooperative looking to implement a blockchain-based traceability system to verify the authenticity of our products from farm to table.', 'Complete system including farmer onboarding, QR code generation, blockchain implementation, and consumer-facing app.', '4 months', '$80,000', 'Blockchain infrastructure, Mobile app for farmers, QR code system, Consumer-facing web app, Documentation', 'System must be user-friendly for farmers with limited technical expertise. Must support at least 100 different products and 50 farms.', NULL, NULL, NULL, 'We have relationships with 30 farms that are ready to participate in the initial rollout.', 'submitted', '2025-04-02 20:19:12.611094+00', '2025-04-07 20:19:12.611094+00'),
	('d4e5f6a7-b8c9-40d1-d2e3-f4a5b6c7d8e9', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'provide', 'RetailVision: Advanced Analytics Platform for Retail Optimization', 'Our RetailVision platform uses computer vision and AI to analyze customer behavior in stores and provide actionable insights for layout optimization and inventory management.', 'Full implementation including hardware installation, software setup, analytics dashboard, and staff training.', '3 months', '$95,000', 'Hardware kit (cameras and sensors), Cloud-based analytics platform, Real-time dashboard, Weekly insight reports, Staff training', NULL, '7 years of experience in retail analytics with implementations in over 50 stores across multiple retail categories.', 'We use a non-invasive approach with anonymized tracking to ensure customer privacy while providing detailed insights on traffic patterns and engagement.', '1 Project Manager, 2 Computer Vision Specialists, 1 Data Analyst, 1 Installation Technician, 1 Training Specialist', 'Our system has helped retailers increase sales by an average of 15% through optimized store layouts and product placement.', 'submitted', '2025-05-02 20:19:12.611094+00', '2025-05-02 20:19:12.611094+00'),
	('e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0', 'd9d046e5-67d7-4a05-b4e4-84f1f1e9149e', 'd3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', 'need', 'AI Financial Advisor for Credit Union Members', 'Our credit union is looking to provide an AI-powered financial advisor to our 50,000 members to help them with budgeting, saving, and investment decisions.', 'Complete solution including integration with our banking system, personalized financial advice engine, and member-facing web and mobile interfaces.', '5 months', '$120,000', 'Banking system integration, AI advisory engine, Web portal, Mobile app, Member education materials', 'Must comply with all financial regulations and integrate with our core banking system (FIS). Must support at least 10,000 concurrent users.', NULL, NULL, NULL, 'We have a dedicated team that can assist with integration and testing.', 'submitted', '2025-03-18 20:19:12.611094+00', '2025-03-23 20:19:12.611094+00'),
	('f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1', 'd9d046e5-67d7-4a05-b4e4-84f1f1e9149e', 'e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', 'provide', 'EduVerse: Immersive Virtual Learning Environment', 'Our EduVerse platform creates engaging virtual classrooms that simulate physical learning environments while adding interactive elements not possible in the real world.', 'Complete virtual learning environment including customizable classrooms, interactive learning tools, and integration with existing LMS platforms.', '4 months', '$110,000', 'Virtual classroom platform, Content creation tools, LMS integration, Teacher training program, Technical support package', NULL, '5 years of experience in educational technology with implementations at 20+ educational institutions.', 'We use a modular approach that allows for customization based on specific subject needs, with a focus on creating engaging, interactive learning experiences.', '1 Project Manager, 2 VR Developers, 1 Educational Content Specialist, 1 UI/UX Designer, 1 Training Coordinator', 'Our platform has shown a 40% increase in student engagement and a 25% improvement in information retention compared to traditional online learning.', 'accepted', '2025-03-03 20:19:12.611094+00', '2025-03-18 20:19:12.611094+00'),
	('74e9844c-2730-4669-a6a4-0fdeed8e7a0f', 'f80838d7-5c01-4fb1-906d-6de22980b011', 'bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'provide', 'Proposal for: Google Research at Google I/O 2025', '', '', '', '', '', '', '', '', '', '', 'draft', '2025-05-23 18:13:59.171776+00', '2025-05-23 18:13:59.171776+00'),
	('702cb480-2f25-4c7e-9935-0bae88fc37c2', 'f80838d7-5c01-4fb1-906d-6de22980b011', 'bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'provide', 'Proposal for: Google Research at Google I/O 2025', '', '', '', '', '', '', '', '', '', '', 'submitted', '2025-05-23 18:14:31.524523+00', '2025-05-23 18:14:31.524523+00'),
	('569ccdd1-b558-4970-819c-ab598eb1424f', 'f80838d7-5c01-4fb1-906d-6de22980b011', 'bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'need', 'test Proposal for: Google Research at Google I/O 2025', '', '', '', '', '', '', '', '', '', '', 'draft', '2025-05-23 18:15:31.559619+00', '2025-05-23 18:15:31.559619+00'),
	('7ee2013c-2021-45b4-b60a-a5cebf9ee78f', '2c1979f5-ca56-4d24-812c-1aadb8409e88', '7a572550-5dee-41e2-b329-dba4338ddbec', 'need', 'Proposal for: From diagnosis to treatment: Advancing AMIE for longitudinal disease management', 'Test', 'Test', '3 months', '5000$', 'test', 'Test', '', '', '', 'Test', 'submitted', '2025-05-30 00:25:39.028726+00', '2025-05-30 00:25:39.028726+00'),
	('cfa2eea1-cfea-434c-be67-300d82025e35', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', '7a572550-5dee-41e2-b329-dba4338ddbec', 'provide', 'Proposal for: From diagnosis to treatment: Advancing AMIE for longitudinal disease management', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', '25523 weeks', '3552$', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', '', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', 'submitted', '2025-06-04 11:03:42.789389+00', '2025-06-04 11:03:42.789389+00'),
	('10c91b8f-f224-4336-b1b2-0c7938beda4c', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', '248c43c5-de9f-4904-9b64-697a180f1a58', 'need', 'Proposal for: The evolution of graph learning', 'Proposal for: The evolution of graph learning', 'Proposal for: The evolution of graph learning', 'Proposal for: The evolution of graph learning', 'Proposal for: The evolution of graph learning', 'Proposal for: The evolution of graph learning', 'Proposal for: The evolution of graph learning', '', '', '', 'Proposal for: The evolution of graph learning', 'submitted', '2025-06-04 11:16:03.539704+00', '2025-06-04 11:16:03.539704+00');


--
-- Data for Name: contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."contracts" ("id", "match_id", "provider_id", "needer_id", "title", "status", "start_date", "end_date", "exclusivity_ends", "budget", "scope", "created_at", "updated_at", "provider_signed", "needer_signed", "proposal_id") VALUES
	('e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6', 'c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8', 'd9d046e5-67d7-4a05-b4e4-84f1f1e9149e', '550e8400-e29b-41d4-a716-446655440000', 'EduVerse Virtual Learning Environment Implementation', 'active', '2025-04-07 20:21:04.769076+00', '2025-08-05 20:21:04.769076+00', '2025-12-03 20:21:04.769076+00', '$110,000', 'Implementation of the EduVerse virtual learning environment including customizable classrooms, interactive learning tools, and LMS integration.', '2025-04-05 20:21:04.769076+00', '2025-04-05 20:21:04.769076+00', false, false, NULL),
	('c413b33b-7083-4227-981e-fb61e3ac1b5b', '4daec3be-7779-45fe-a18d-c869cb14c221', '2c1979f5-ca56-4d24-812c-1aadb8409e88', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', 'Contract for Proposal 7ee2013c-2021-45b4-b60a-a5cebf9ee78f', 'pending_start', '2025-06-04 10:54:32.627+00', '2027-07-04 10:54:32.627+00', '2027-08-03 10:54:32.627+00', '4000', 'Test', '2025-06-04 10:54:32.834962+00', '2025-06-04 10:54:32.834962+00', false, false, NULL),
	('d18b9a3e-9577-4aaa-bd9d-9b14f90bd3cb', 'dd19321a-754a-4c54-bfcd-1e56bcb7afe1', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', '2c1979f5-ca56-4d24-812c-1aadb8409e88', 'Contract for Proposal cfa2eea1-cfea-434c-be67-300d82025e35', 'pending_start', '2025-06-04 11:05:56.716+00', '2026-04-04 11:05:56.716+00', '2026-05-04 11:05:56.716+00', '2000', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', '2025-06-04 11:05:56.957561+00', '2025-06-04 11:05:56.957561+00', false, false, NULL),
	('be99a7db-337e-44a4-94c6-f9019a63c54b', '83fd7e18-337d-4635-9936-09fcef7ca7e4', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', '2c1979f5-ca56-4d24-812c-1aadb8409e88', 'Contract for Proposal 10c91b8f-f224-4336-b1b2-0c7938beda4c', 'pending_start', '2025-06-04 11:17:16.471+00', '2025-09-04 11:17:16.471+00', '2025-10-04 11:17:16.471+00', 'Proposal for: The evolution of graph learning', 'Proposal for: The evolution of graph learning', '2025-06-04 11:17:16.711683+00', '2025-06-04 11:17:16.711683+00', false, false, '10c91b8f-f224-4336-b1b2-0c7938beda4c');


--
-- Data for Name: contract_activities; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: contract_deliverables; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."contract_deliverables" ("id", "contract_id", "description", "created_at") VALUES
	('a2dd9f88-775f-4fdb-accf-7a48ccd6ec1f', 'c413b33b-7083-4227-981e-fb61e3ac1b5b', 'test', '2025-06-04 10:54:32.995661+00'),
	('b5c8318d-0aa1-419b-ad78-045d1bb21965', 'd18b9a3e-9577-4aaa-bd9d-9b14f90bd3cb', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', '2025-06-04 11:05:57.189972+00'),
	('db6cca75-3f33-449b-ac37-30404c105d49', 'be99a7db-337e-44a4-94c6-f9019a63c54b', 'Proposal for: The evolution of graph learning', '2025-06-04 11:17:16.936101+00');


--
-- Data for Name: contract_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: contract_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."contract_messages" ("id", "contract_id", "user_id", "content", "created_at") VALUES
	('d7e8f9a0-b1c2-44d5-d6e7-f8a9b0c1d2e3', 'e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6', 'd9d046e5-67d7-4a05-b4e4-84f1f1e9149e', 'We''ve completed the first milestone and are making good progress on the core platform development.', '2025-04-28 20:21:04.769076+00'),
	('e8f9a0b1-c2d3-45e6-e7f8-a9b0c1d2e3f4', 'e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6', '550e8400-e29b-41d4-a716-446655440000', 'Great to hear! The requirements documentation looks excellent. Looking forward to seeing the core platform.', '2025-04-29 20:21:04.769076+00'),
	('f9a0b1c2-d3e4-46f7-f8a9-b0c1d2e3f4a5', 'e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6', 'd9d046e5-67d7-4a05-b4e4-84f1f1e9149e', 'We''ve completed the virtual classroom environment and user authentication system. Working on the content management system now.', '2025-05-10 20:21:04.769076+00'),
	('a0b1c2d3-e4f5-47a8-a9b0-c1d2e3f4a5b6', 'e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6', '550e8400-e29b-41d4-a716-446655440000', 'The virtual classroom looks fantastic! Our teachers are excited to start using it.', '2025-05-13 20:21:04.769076+00');


--
-- Data for Name: contract_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."contract_milestones" ("id", "contract_id", "name", "description", "percentage", "amount", "due_date", "status", "completed_date", "created_at", "updated_at") VALUES
	('f2a3b4c5-d6e7-48f9-f0a1-b2c3d4e5f6a7', 'e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6', 'Project Kickoff and Requirements', 'Initial meetings, detailed requirements documentation, and project plan creation.', 20, '$22,000', '2025-04-27 20:21:04.769076+00', 'completed', NULL, '2025-04-05 20:21:04.769076+00', '2025-04-27 20:21:04.769076+00'),
	('a3b4c5d6-e7f8-49a0-a1b2-c3d4e5f6a7b8', 'e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6', 'Core Platform Development', 'Development of the virtual classroom environment and basic functionality.', 30, '$33,000', '2025-05-27 20:21:04.769076+00', 'in_progress', NULL, '2025-04-05 20:21:04.769076+00', '2025-05-02 20:21:04.769076+00'),
	('b4c5d6e7-f8a9-40b1-b2c3-d4e5f6a7b8c9', 'e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6', 'Interactive Tools and LMS Integration', 'Development of interactive learning tools and integration with existing LMS platforms.', 25, '$27,500', '2025-06-26 20:21:04.769076+00', 'pending', NULL, '2025-04-05 20:21:04.769076+00', '2025-04-05 20:21:04.769076+00'),
	('c5d6e7f8-a9b0-41c2-c3d4-e5f6a7b8c9d0', 'e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6', 'Testing, Training, and Deployment', 'System testing, teacher training, and full deployment.', 25, '$27,500', '2025-07-26 20:21:04.769076+00', 'pending', NULL, '2025-04-05 20:21:04.769076+00', '2025-04-05 20:21:04.769076+00');


--
-- Data for Name: contract_milestone_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: contract_milestone_deliverables; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."contract_milestone_deliverables" ("id", "milestone_id", "description", "completed", "created_at", "updated_at") VALUES
	('d5e6f7a8-b9c0-42d3-d4e5-f6a7b8c9d0e1', 'f2a3b4c5-d6e7-48f9-f0a1-b2c3d4e5f6a7', 'Requirements documentation', true, '2025-04-05 20:21:04.769076+00', '2025-04-22 20:21:04.769076+00'),
	('e6f7a8b9-c0d1-43e4-e5f6-a7b8c9d0e1f2', 'f2a3b4c5-d6e7-48f9-f0a1-b2c3d4e5f6a7', 'Project plan', true, '2025-04-05 20:21:04.769076+00', '2025-04-22 20:21:04.769076+00'),
	('f7a8b9c0-d1e2-44f5-f6a7-b8c9d0e1f2a3', 'f2a3b4c5-d6e7-48f9-f0a1-b2c3d4e5f6a7', 'Technical architecture document', true, '2025-04-05 20:21:04.769076+00', '2025-04-27 20:21:04.769076+00'),
	('a8b9c0d1-e2f3-45a6-a7b8-c9d0e1f2a3b4', 'a3b4c5d6-e7f8-49a0-a1b2-c3d4e5f6a7b8', 'Virtual classroom environment', true, '2025-04-05 20:21:04.769076+00', '2025-05-12 20:21:04.769076+00'),
	('b9c0d1e2-f3a4-46b7-b8c9-d0e1f2a3b4c5', 'a3b4c5d6-e7f8-49a0-a1b2-c3d4e5f6a7b8', 'User authentication system', true, '2025-04-05 20:21:04.769076+00', '2025-05-09 20:21:04.769076+00'),
	('c0d1e2f3-a4b5-47c8-c9d0-e1f2a3b4c5d6', 'a3b4c5d6-e7f8-49a0-a1b2-c3d4e5f6a7b8', 'Basic content management system', false, '2025-04-05 20:21:04.769076+00', '2025-04-05 20:21:04.769076+00'),
	('d1e2f3a4-b5c6-48d9-d0e1-f2a3b4c5d6e7', 'b4c5d6e7-f8a9-40b1-b2c3-d4e5f6a7b8c9', 'Interactive whiteboard tool', false, '2025-04-05 20:21:04.769076+00', '2025-04-05 20:21:04.769076+00'),
	('e2f3a4b5-c6d7-49e0-e1f2-a3b4c5d6e7f8', 'b4c5d6e7-f8a9-40b1-b2c3-d4e5f6a7b8c9', 'Group collaboration tools', false, '2025-04-05 20:21:04.769076+00', '2025-04-05 20:21:04.769076+00'),
	('f3a4b5c6-d7e8-40f1-f2a3-b4c5d6e7f8a9', 'b4c5d6e7-f8a9-40b1-b2c3-d4e5f6a7b8c9', 'LMS integration module', false, '2025-04-05 20:21:04.769076+00', '2025-04-05 20:21:04.769076+00'),
	('a4b5c6d7-e8f9-41a2-a3b4-c5d6e7f8a9b0', 'c5d6e7f8-a9b0-41c2-c3d4-e5f6a7b8c9d0', 'System testing report', false, '2025-04-05 20:21:04.769076+00', '2025-04-05 20:21:04.769076+00'),
	('b5c6d7e8-f9a0-42b3-b4c5-d6e7f8a9b0c1', 'c5d6e7f8-a9b0-41c2-c3d4-e5f6a7b8c9d0', 'Teacher training materials', false, '2025-04-05 20:21:04.769076+00', '2025-04-05 20:21:04.769076+00'),
	('c6d7e8f9-a0b1-43c4-c5d6-e7f8a9b0c1d2', 'c5d6e7f8-a9b0-41c2-c3d4-e5f6a7b8c9d0', 'Deployment documentation', false, '2025-04-05 20:21:04.769076+00', '2025-04-05 20:21:04.769076+00');


--
-- Data for Name: milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."milestones" ("id", "proposal_id", "name", "description", "percentage", "amount", "due_date", "status", "created_at", "updated_at") VALUES
	('a7b8c9d0-e1f2-43a4-a5b6-c7d8e9f0a1b2', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1', 'Project Kickoff and Requirements Gathering', 'Initial meetings, detailed requirements documentation, and project plan creation.', 20, '$22,000', '2025-06-01 20:19:12.611094+00', 'in_progress', '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('b8c9d0e1-f2a3-44b5-b6c7-d8e9f0a1b2c3', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1', 'Core Platform Development', 'Development of the virtual classroom environment and basic functionality.', 30, '$33,000', '2025-07-01 20:19:12.611094+00', 'pending', '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('c9d0e1f2-a3b4-45c6-c7d8-e9f0a1b2c3d4', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1', 'Interactive Tools and LMS Integration', 'Development of interactive learning tools and integration with existing LMS platforms.', 25, '$27,500', '2025-07-31 20:19:12.611094+00', 'pending', '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('d0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1', 'Testing, Training, and Deployment', 'System testing, teacher training, and full deployment.', 25, '$27,500', '2025-08-30 20:19:12.611094+00', 'pending', '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00');


--
-- Data for Name: deliverables; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."deliverables" ("id", "milestone_id", "description", "completed", "created_at", "updated_at") VALUES
	('d1e2f3a4-b5c6-47d8-d9e0-f1a2b3c4d5e6', 'a7b8c9d0-e1f2-43a4-a5b6-c7d8e9f0a1b2', 'Requirements documentation', true, '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('e2f3a4b5-c6d7-48e9-e0f1-a2b3c4d5e6f7', 'a7b8c9d0-e1f2-43a4-a5b6-c7d8e9f0a1b2', 'Project plan', true, '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('f3a4b5c6-d7e8-49f0-f1a2-b3c4d5e6f7a8', 'a7b8c9d0-e1f2-43a4-a5b6-c7d8e9f0a1b2', 'Technical architecture document', false, '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('a4b5c6d7-e8f9-40a1-a2b3-c4d5e6f7a8b9', 'b8c9d0e1-f2a3-44b5-b6c7-d8e9f0a1b2c3', 'Virtual classroom environment', false, '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('b5c6d7e8-f9a0-41b2-b3c4-d5e6f7a8b9c0', 'b8c9d0e1-f2a3-44b5-b6c7-d8e9f0a1b2c3', 'User authentication system', false, '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('c6d7e8f9-a0b1-42c3-c4d5-e6f7a8b9c0d1', 'b8c9d0e1-f2a3-44b5-b6c7-d8e9f0a1b2c3', 'Basic content management system', false, '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('d7e8f9a0-b1c2-43d4-d5e6-f7a8b9c0d1e2', 'c9d0e1f2-a3b4-45c6-c7d8-e9f0a1b2c3d4', 'Interactive whiteboard tool', false, '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('e8f9a0b1-c2d3-44e5-e6f7-a8b9c0d1e2f3', 'c9d0e1f2-a3b4-45c6-c7d8-e9f0a1b2c3d4', 'Group collaboration tools', false, '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('f9a0b1c2-d3e4-45f6-f7a8-b9c0d1e2f3a4', 'c9d0e1f2-a3b4-45c6-c7d8-e9f0a1b2c3d4', 'LMS integration module', false, '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5', 'System testing report', false, '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5', 'Teacher training materials', false, '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00'),
	('c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5', 'Deployment documentation', false, '2025-05-17 20:19:12.611094+00', '2025-05-17 20:19:12.611094+00');


--
-- Data for Name: document_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: industries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."industries" ("id", "name") VALUES
	('1f8f7c6a-9c5d-4b3e-8a7f-6d9c8b7a6f5e', 'Healthcare'),
	('2e9f8d7b-0d6e-5c4f-9a8b-7e0d9c8b7a6f', 'Finance'),
	('3f0e9d8c-1e7f-6d5f-0b9c-8f1e0d9c8b7a', 'Retail'),
	('4f1f0e9d-2f8f-7e6f-1c0d-9f2f1e0d9c8b', 'Manufacturing'),
	('5f2f1f0e-3f9f-8f7f-2d1e-0f3f2f1e0d9c', 'Education'),
	('13d884ee-0d06-4540-9297-bc969672a00e', 'Agriculture'),
	('54346636-cc6d-408b-97d8-53c555cb1931', 'Aerospace'),
	('ccf8cd01-c930-4d66-8a55-14737f4c4c81', 'Automotive'),
	('049be708-f45b-4635-9350-22c1433dfc8e', 'Biotechnology'),
	('f4ec34d3-9253-4fe0-8569-edf342dca5a9', 'Biomedical Research'),
	('a1067921-a1f4-4828-afe9-1f213a8df88c', 'Child Development'),
	('8b2caeff-c00a-47da-9375-79cc29a5abca', 'Conservation'),
	('1da907b6-1d9b-441c-abd7-29557f8a9fe8', 'Creative Arts'),
	('968c50a7-b1de-40ce-807f-0aec0897282f', 'Cybersecurity'),
	('03943667-9f7f-4971-be29-83e84a93728f', 'Defense'),
	('0707ea0b-70cc-467a-af53-ed37960dc3b8', 'Delivery Services'),
	('ac6fa7c4-d501-496e-8558-bcd7364224ec', 'EdTech'),
	('0a11afde-2b73-4775-bc3a-9acb31dffd75', 'E-commerce'),
	('3f01597e-4ede-468b-bb7b-c0827c57a81b', 'Emergency Medicine'),
	('a6c03c89-6b91-44fb-b81e-5f30880b8559', 'Emergency Services'),
	('47f2f015-7665-4f15-b736-938008c92fd6', 'Engineering'),
	('be9c69a3-b3f8-4725-bbac-3b90f34ad0fc', 'Entertainment'),
	('1b310c50-ef0b-4c39-93f3-ddb6ed39d88c', 'FMCG'),
	('339fd801-a2d3-4270-9da7-22728ea8e378', 'Food & Beverage'),
	('8791ccf3-1f4b-4490-b08d-287b76b7e0c2', 'Gaming'),
	('82fa0db7-698a-4b88-8f3d-e6381280a027', 'Hospitality'),
	('3416bdf4-3fd9-4a4b-ac25-838cfe1f927c', 'IoT (Internet of Things)'),
	('a897e7c1-59ce-4b5d-a106-6d5263894867', 'Legal'),
	('cd3e9fd7-fbe6-4aa8-ac2c-53e360a9e5f4', 'Logistics'),
	('5430fe0a-1a8d-46c7-804a-0f95234fce34', 'Maritime'),
	('84841180-ed5f-40f3-8fe0-98d61af341c4', 'Medical Research'),
	('8730031e-ce3e-4710-a072-e9d83931bed1', 'Mental Health (Therapy and Counseling)'),
	('07888d32-d64a-41c1-8dff-ed9dbbfef49b', 'Music'),
	('2724ac77-bd50-459d-aacf-40ad0f88e8f2', 'Music Technology'),
	('2c4594fb-12c2-48d8-9ea5-f3fe9ad7f233', 'Non-Profit'),
	('58ea4756-36e7-48f6-a8d5-efb2c8ba4252', 'Pharmaceuticals'),
	('0e93c263-686d-47bb-be43-e0cb3dfef175', 'Public Safety'),
	('1fc2a030-1587-4b24-9225-79208ea766b7', 'Publishing'),
	('71d6b486-e834-4508-9e19-ba6242256500', 'Robotics'),
	('c629fc05-b689-4d26-8f9c-19bf213d059a', 'Semiconductors'),
	('6167867d-f787-4c78-bf36-c7164c4cc4ff', 'Software Development'),
	('dc719e3b-530c-46fa-a5a6-e59694a2e3ea', 'Software Engineering'),
	('b1620cf8-cdc8-43bc-8ec7-13a4ad21236e', 'Sports Analytics'),
	('62d84260-b341-4aa6-9694-8cd5c8a9b507', 'Telecommunications'),
	('c6d726c0-32ae-4b2e-a855-8717d04a20a8', 'Technology'),
	('a9f9a2a8-332a-4eff-b20b-ee59a185e430', 'Transportation'),
	('de2f09c1-a744-4479-9b5e-829f3b8ab327', 'Travel'),
	('72aeb36e-1981-4c43-93d5-9c5761986fae', 'Urban Planning'),
	('be98abd5-b48c-49b7-b82e-eebe82154f0d', 'AI Research (Artificial Intelligence Research)'),
	('5b242780-72d2-4f4d-9276-1f8390997bb9', 'Autonomous Driving/Autonomous Vehicles'),
	('631445b8-3df1-491a-9a28-6560ef0cf319', 'Augmented Reality'),
	('4ba5905b-b1d2-427f-bf6f-78316bbf58a1', 'Copyright'),
	('49e2a0a8-b8bb-4bb2-a7be-5ab93634c87c', 'Customer Service'),
	('9bafe7ed-75e5-4836-919e-ba59cd1f19ca', 'Corporate Training'),
	('82dbaf6b-4972-46c6-bebb-de229c17af10', 'Cryptography'),
	('9f2d1b2d-952e-4a4e-a033-a3f41de32c0f', 'Environmental Monitoring'),
	('33c373d3-c85e-423b-a054-676991726242', 'Health Tech'),
	('246a878e-c4a0-4abe-890d-4be886f352ee', 'Information Technology'),
	('2ef50906-a19f-41bd-9d87-cd85c2da647f', 'Investment'),
	('a8a51479-3af1-488b-90c9-9dc7ebc10f09', 'IT Services'),
	('9e24fef1-1240-4abe-9884-3bcdbc275100', 'Livestock Management'),
	('5ab5d2fb-3934-4040-bb59-0e7606e8f7bd', 'Machine Learning'),
	('ac1a4d13-8e68-4f92-ab9e-d514e5798487', 'Media'),
	('acbc93da-e85d-40cd-8e3d-14be0bac3488', 'Media and Entertainment'),
	('e96f1120-e111-49b2-aa62-f0a708652a47', 'Networking'),
	('aaf81e5b-2055-4e20-98c5-0701ce25ac3d', 'Online Education'),
	('4d110f76-f066-4a3c-9762-ceb3265dfa13', 'Product Design'),
	('23d05f19-61a8-442e-8446-ccfa9b4e2198', 'Research'),
	('65c0dd49-537b-48d7-9908-d0617dff0d6e', 'Remote Sensing'),
	('97c40da3-9093-4594-a753-d8dad8bbce5e', 'Security'),
	('bfe5eba5-3c53-47c7-835d-3082b3f4bc43', 'Social Media'),
	('58cfde0c-a0b9-4c9b-89b2-1a20ce5cfe57', 'Trading'),
	('f4320526-41d9-4cbc-a03c-cf3f2a8227fd', 'Telemedicine'),
	('708e3e82-1958-4036-b37e-3ad1ddd63d44', 'Architecture'),
	('14138ecc-f6dd-49cb-a98e-cb5417677148', 'Civil Engineering'),
	('1acc4494-8cf4-4078-a576-5a0e1e7e5917', 'Construction'),
	('ec6e78ca-9ec1-4c4b-822b-36e53d8b426a', 'Real Estate Development'),
	('3d6392b3-c0c4-4b81-a21a-e6a517d0de61', 'Urban Infrastructure'),
	('dbfbbcae-505f-444b-b233-e50df13b216a', 'Renewable Energy'),
	('0fe7e940-fc3b-4b84-8b44-339594925128', 'Waste Management'),
	('d7cac4c1-37ef-4c8a-b89b-d8f9b61058e0', 'Water Management'),
	('d0815550-9735-4d66-9984-d907e214eea7', 'Environmental Services'),
	('e0c53b75-14d6-4994-844d-8103fdc3646a', 'Green Tech'),
	('f4b7a629-e722-4355-baff-523bf216ca86', 'Carbon Capture'),
	('e37d94b6-3028-4189-ab32-cf779f3ec0a7', 'Neuroscience'),
	('0ab5dd16-8c56-4ffa-9760-b66627451155', 'Space Research'),
	('e034da0e-0a3a-49fc-b1b5-c7672c86a157', 'Quantum Computing'),
	('766e1e89-1919-4e70-bd2e-70b7ec596a3a', 'Behavioral Science'),
	('817f6b47-bde7-4d73-ab89-09de2aaf9568', 'Cognitive Science'),
	('967ecf2e-7763-4101-8afc-0b3804c30cf7', 'Business Intelligence'),
	('c3a3c031-3938-4d79-88d4-f2c06a9090e0', 'Human Resources (HR Tech)'),
	('7b0b42a4-8bba-451c-95d5-931d652be3b0', 'Marketing & Advertising'),
	('db04b320-b8d3-4f2f-a36f-1b15ef8738af', 'Market Research'),
	('453cca62-ed25-41b4-a86b-c77c73a091a8', 'Management Consulting'),
	('d1d5ea49-ea09-48dc-86e1-908bf830b524', 'Procurement'),
	('aec63849-4d1f-465d-94d4-1b93eb7b0cc9', 'Higher Education'),
	('851227b7-27b9-42a9-af20-2ab8d0ea48ac', 'Language Learning'),
	('94d43d5e-328e-4b17-b200-c35df8c42a5b', 'Library & Archival Sciences'),
	('7938ee16-38bc-4345-b632-f72ac6ed8139', 'Cultural Heritage'),
	('67df6117-8fc5-4a4a-937e-8066e57befb8', 'Civic Technology'),
	('315f181a-6807-4faf-a39a-95089632741c', 'Government'),
	('ee0ba456-95f6-4dbe-a169-09fd522864c5', 'Law Enforcement'),
	('a01d24ad-ee6f-4acb-b657-1cb9d33f643b', 'International Development'),
	('5af9e7df-8bf9-4c42-b61b-99299a54ad3f', 'Public Policy'),
	('d96e46f0-c592-447c-b8b6-d6d80077955f', 'Human Rights'),
	('4da74cd1-dad2-4486-b2f1-44a927d10351', 'Immigration Services'),
	('3fb3be34-f31d-4f94-8a8b-088830924080', 'Mining'),
	('4587521e-c2e9-48e3-bcd2-95bbde604cf8', 'Oil & Gas'),
	('344627eb-540d-4236-b6c1-ece778460e36', 'Energy'),
	('15532899-ad9e-4601-af37-f56b60695831', 'Supply Chain Management'),
	('fec23124-08da-4bda-a7f0-cad2bd78e614', 'Industrial Automation'),
	('e12c2c21-9bb9-4df5-8f36-d831878fdf27', 'Chemical Engineering'),
	('2614380f-5dc2-4d71-8091-86ab3c93870a', 'Materials Science'),
	('bb8885de-b498-49fe-8d4d-f459bca0211f', 'Genomics'),
	('1b3d6943-2a5f-4e38-ad78-5837221371c7', 'Bioinformatics'),
	('0c9bdb78-63dd-4375-942d-c8d4bb40e09a', 'Veterinary Medicine'),
	('cbd9d02d-b0a1-4efb-bac1-a6a974da4098', 'Agritech'),
	('1daf4f72-7ab6-490b-8c23-d9446e8fd4a2', 'Nutrition'),
	('d2d2f78c-948f-437b-8933-b11c1c0a0175', 'Luxury Goods'),
	('13cf617b-f390-45f9-95de-4c8b6023f983', 'Fashion'),
	('430f59ff-e252-48a3-86e8-877e6f282433', 'Home Automation'),
	('52bd0b3f-e247-46ac-8523-f8c43462d3a5', 'Personal Finance'),
	('e706d6ce-02c1-4133-b89c-c3b11930bb43', 'Insurance'),
	('edd0d2d4-3a85-422d-8884-9032eb5aaee8', 'Real Estate'),
	('dd973599-3bea-413e-a3b3-fb5274fd26df', 'Edge Computing'),
	('5172662d-1bb7-4a13-a65b-6296ac05977e', 'DevOps'),
	('715f35ab-bc62-4349-8cfc-537907c1b562', 'Cloud Computing'),
	('d5ad1d36-7ddc-4c3f-9f34-acf9bf75fa3e', 'Blockchain'),
	('54fc7e40-eccc-4568-aca8-317924b76eaa', 'NFTs / Web3'),
	('f27bfdc8-a7fe-4329-9c73-0c513b71d6e4', 'Synthetic Media'),
	('22a8a7df-bad2-4a0e-8bda-e91d12c9339d', 'Digital Twins'),
	('c5f37391-77b4-4bca-871c-e42487ba8c39', 'Smart Cities'),
	('ceef80bc-084d-4858-a60d-4d9606b5d108', 'Human-Computer Interaction'),
	('97779363-d83b-481c-afce-970b5acc6d44', 'Wearable Tech'),
	('5e1a9bb7-4ffc-415f-9c85-b11b4770ef92', 'Voice Tech'),
	('b58b8f47-2cb9-410d-8b97-a713b5fa8160', 'Geriatrics'),
	('639aface-b650-49ea-9c5d-029b73b354b3', 'Pediatric Medicine'),
	('9a86e50b-9b24-40e7-868a-ccb8c7762de3', 'Preventive Medicine'),
	('5e593da9-013d-43cf-aef5-eebf5c4eb49f', 'Digital Health Records (EHR/EMR)'),
	('56bbcf63-77a6-4b3d-9414-3de55b1e3b18', 'Visual Arts'),
	('bb4cee09-5535-4413-96e7-e41e80269398', 'Film & TV'),
	('00ad68df-5078-48e6-9666-afe097937501', 'Photography'),
	('b42092e8-ec2a-4f3a-abe2-1831018d67f0', 'Fashion Technology'),
	('12189817-19df-4c4c-8475-797fb48bea27', 'Lifestyle & Wellness');


--
-- Data for Name: match_proposals; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."match_proposals" ("match_id", "proposal_id") VALUES
	('a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6'),
	('a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', 'b2c3d4e5-f6a7-48b9-b0c1-d2e3f4a5b6c7'),
	('b2c3d4e5-f6a7-48b9-b0c1-d2e3f4a5b6c7', 'c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8'),
	('c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1');


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."messages" ("id", "match_id", "user_id", "content", "is_counter_offer", "counter_offer_budget", "counter_offer_timeline", "created_at") VALUES
	('d4e5f6a7-b8c9-40d1-d2e3-f4a5b6c7d8e9', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', '550e8400-e29b-41d4-a716-446655440000', 'Thank you for your proposal. We''re interested in moving forward but have some questions about the implementation timeline.', false, NULL, NULL, '2025-05-03 20:21:04.769076+00'),
	('e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'We''d be happy to discuss the timeline. What specific concerns do you have?', false, NULL, NULL, '2025-05-04 20:21:04.769076+00'),
	('f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', '550e8400-e29b-41d4-a716-446655440000', 'We need to have the system operational before the start of the next quarter. Also, we''d like to discuss the budget.', true, '$130,000', '4 months', '2025-05-05 20:21:04.769076+00'),
	('a7b8c9d0-e1f2-43a4-a5b6-c7d8e9f0a1b2', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'We can accelerate certain phases to meet your timeline. Regarding the budget, we can work with $135,000 but would need to adjust the scope slightly.', true, '$135,000', '4.5 months', '2025-05-07 20:21:04.769076+00'),
	('b8c9d0e1-f2a3-44b5-b6c7-d8e9f0a1b2c3', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', '550e8400-e29b-41d4-a716-446655440000', 'That sounds reasonable. Can you provide details on what aspects of the scope would be adjusted?', false, NULL, NULL, '2025-05-09 20:21:04.769076+00'),
	('c9d0e1f2-a3b4-45c6-c7d8-e9f0a1b2c3d4', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'We would reduce the number of custom integrations from 3 to 2, and provide a more streamlined training program. The core functionality would remain unchanged.', false, NULL, NULL, '2025-05-11 20:21:04.769076+00'),
	('d0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', '550e8400-e29b-41d4-a716-446655440000', 'That works for us. Let''s proceed with these terms.', false, NULL, NULL, '2025-05-14 20:21:04.769076+00');


--
-- Data for Name: negotiation_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."negotiation_messages" ("id", "proposal_id", "sender_id", "content", "is_counter_offer", "counter_offer_budget", "counter_offer_timeline", "created_at", "updated_at") VALUES
	('1d243df8-c074-458a-867c-7386bb6dc3d1', '7ee2013c-2021-45b4-b60a-a5cebf9ee78f', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', 'Test', false, NULL, NULL, '2025-06-04 10:47:03.204413+00', '2025-06-04 10:47:03.204413+00'),
	('be7e29fb-7bd2-44ad-bf9c-502ec7c61323', '7ee2013c-2021-45b4-b60a-a5cebf9ee78f', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', '', true, '4000', '25 months', '2025-06-04 10:47:11.638257+00', '2025-06-04 10:47:11.638257+00'),
	('3ce17bbc-694b-44ec-b9d3-ad10af2216a1', 'cfa2eea1-cfea-434c-be67-300d82025e35', '2c1979f5-ca56-4d24-812c-1aadb8409e88', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', false, NULL, NULL, '2025-06-04 11:04:54.721781+00', '2025-06-04 11:04:54.721781+00'),
	('f8d0ee23-dc23-47f6-9354-346cfe023aff', 'cfa2eea1-cfea-434c-be67-300d82025e35', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', '', true, '2000', '10 weeeks', '2025-06-04 11:05:46.188887+00', '2025-06-04 11:05:46.188887+00'),
	('1a4e5538-5674-467d-acc9-3e6b8fb35f07', '10c91b8f-f224-4336-b1b2-0c7938beda4c', '2c1979f5-ca56-4d24-812c-1aadb8409e88', 'sods', false, NULL, NULL, '2025-06-04 11:16:35.508631+00', '2025-06-04 11:16:35.508631+00');


--
-- Data for Name: proposal_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."proposal_comments" ("id", "proposal_id", "user_id", "content", "created_at") VALUES
	('6de2e6be-3027-4e63-81ad-34fa3c78b6b3', '7ee2013c-2021-45b4-b60a-a5cebf9ee78f', '2c1979f5-ca56-4d24-812c-1aadb8409e88', 'test', '2025-05-31 06:56:30.690636+00');


--
-- Data for Name: proposal_milestones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."proposal_milestones" ("id", "proposal_id", "name", "description", "status", "created_at", "updated_at", "percentage", "amount") VALUES
	('b69e1ef3-bc26-43ce-b770-8562885482f4', '7ee2013c-2021-45b4-b60a-a5cebf9ee78f', 'Test', '', 'pending', '2025-05-30 00:25:39.274392+00', '2025-05-30 00:25:39.274392+00', 25, '$325'),
	('717a0d74-17a7-4d7f-86c8-61f22fdd279c', '7ee2013c-2021-45b4-b60a-a5cebf9ee78f', 'sods', 'end', 'pending', '2025-05-30 00:25:39.274392+00', '2025-05-30 00:25:39.274392+00', 75, '$5 000'),
	('c5aaaa0d-4dad-474e-a8cb-e82d91eb03a2', 'cfa2eea1-cfea-434c-be67-300d82025e35', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', 'pending', '2025-06-04 11:03:43.018373+00', '2025-06-04 11:03:43.018373+00', 100, '$3 000');


--
-- Data for Name: proposal_deliverables; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."proposal_deliverables" ("id", "milestone_id", "description", "completed", "created_at") VALUES
	('c70b891e-7ada-4026-805b-a8605b0d1b22', 'b69e1ef3-bc26-43ce-b770-8562885482f4', 'test', false, '2025-05-30 00:25:39.516934+00'),
	('e67ed98d-7e64-4af1-bbbf-d830581caccd', 'b69e1ef3-bc26-43ce-b770-8562885482f4', 'dsvsv', false, '2025-05-30 00:25:39.516934+00'),
	('9d15f174-21bb-4910-91e2-fcdf61915ae8', '717a0d74-17a7-4d7f-86c8-61f22fdd279c', 'ssd', false, '2025-05-30 00:25:39.697261+00'),
	('b9efb2a7-5740-44dd-a469-42beaaee32e1', 'c5aaaa0d-4dad-474e-a8cb-e82d91eb03a2', 'From diagnosis to treatment: Advancing AMIE for longitudinal disease management', false, '2025-06-04 11:03:43.252009+00');


--
-- Data for Name: proposal_files; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."proposal_files" ("id", "proposal_id", "name", "size", "type", "created_at", "user_id", "path") VALUES
	('d1e6c22f-09c3-45e3-a0c4-2e5e11a66903', 'cfa2eea1-cfea-434c-be67-300d82025e35', '2j2d2f1d1j1o_2j.2j._2u1a1t1f1n1a1t1j1y1f1s1l1j1f_1p1s1o1p1c2c_1n1a1z1j1o1o1p1d1p_1p1b1u1y1f1o1j2g_1j_1q1r1p1d1o1p1i1j1r1p1c1a1o1j2g._2014.pdf', '2149621', 'application/pdf', '2025-06-04 11:03:45.561377+00', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', 'proposals/cfa2eea1-cfea-434c-be67-300d82025e35/1749035023232-2j2d2f1d1j1o_2j.2j._2u1a1t1f1n1a1t1j1y1f1s1l1j1f_1p1s1o1p1c2c_1n1a1z1j1o1o1p1d1p_1p1b1u1y1f1o1j2g_1j_1q1r1p1d1o1p1i1j1r1p1c1a1o1j2g._2014.pdf');


--
-- Data for Name: smartject_business_functions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."smartject_business_functions" ("smartject_id", "function_id") VALUES
	('a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8'),
	('a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8'),
	('c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6'),
	('c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'b2c3d4e5-f6a7-48b9-b0c1-d2e3f4a5b6c7'),
	('d3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', 'b2c3d4e5-f6a7-48b9-b0c1-d2e3f4a5b6c7'),
	('e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', 'd4e5f6a7-b8c9-40d1-d2e3-f4a5b6c7d8e9'),
	('e099c354-1819-4130-8482-57b240b814e2', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('e099c354-1819-4130-8482-57b240b814e2', '97de20a9-3442-4adb-b83c-693df1a214a7'),
	('e099c354-1819-4130-8482-57b240b814e2', 'c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8'),
	('9187e65a-d9c5-4d8c-ab78-1c5859223998', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6'),
	('9187e65a-d9c5-4d8c-ab78-1c5859223998', 'b2c3d4e5-f6a7-48b9-b0c1-d2e3f4a5b6c7'),
	('9187e65a-d9c5-4d8c-ab78-1c5859223998', 'c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8'),
	('9187e65a-d9c5-4d8c-ab78-1c5859223998', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('22b2a417-12d1-4ba7-bbee-0b770c0c3933', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6'),
	('22b2a417-12d1-4ba7-bbee-0b770c0c3933', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('b762b8cb-0376-459a-a1d4-70df231c3526', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('f45fc70e-9d1e-4434-8478-e78a5ee07882', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('22c36698-1ea9-44d8-869c-32fcd6bbd52c', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('22c36698-1ea9-44d8-869c-32fcd6bbd52c', '97de20a9-3442-4adb-b83c-693df1a214a7'),
	('22c36698-1ea9-44d8-869c-32fcd6bbd52c', '52a4cd2b-b3f1-4891-a015-5379a25f7e9b'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', '97de20a9-3442-4adb-b83c-693df1a214a7'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', '52a4cd2b-b3f1-4891-a015-5379a25f7e9b'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', '626653c7-dd5e-45c5-bcb2-6441601d5c28'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', 'ce9511fd-edcf-4159-9361-0e48013bfaaf'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', 'c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '97de20a9-3442-4adb-b83c-693df1a214a7'),
	('b183ac06-c543-4af1-80e2-0a2adfadbd92', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('b183ac06-c543-4af1-80e2-0a2adfadbd92', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6'),
	('b183ac06-c543-4af1-80e2-0a2adfadbd92', 'b2c3d4e5-f6a7-48b9-b0c1-d2e3f4a5b6c7'),
	('43d93874-f4ea-415e-9e02-8c540df80af1', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('43d93874-f4ea-415e-9e02-8c540df80af1', '97de20a9-3442-4adb-b83c-693df1a214a7'),
	('469065e3-22a3-4ce8-a5da-51cdf23c4b0c', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('469065e3-22a3-4ce8-a5da-51cdf23c4b0c', '97de20a9-3442-4adb-b83c-693df1a214a7'),
	('469065e3-22a3-4ce8-a5da-51cdf23c4b0c', '52a4cd2b-b3f1-4891-a015-5379a25f7e9b'),
	('469065e3-22a3-4ce8-a5da-51cdf23c4b0c', '08b9a54a-86d7-46b8-8fcf-42bfb9d5dd21'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', 'c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6'),
	('7a572550-5dee-41e2-b329-dba4338ddbec', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6'),
	('bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8'),
	('15e85de3-1eb2-4e85-89e5-e894b9801cdd', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('15e85de3-1eb2-4e85-89e5-e894b9801cdd', 'c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8'),
	('15e85de3-1eb2-4e85-89e5-e894b9801cdd', '52a4cd2b-b3f1-4891-a015-5379a25f7e9b'),
	('0c672dd6-427a-40e1-9dcf-c004fb4f88bf', 'a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6'),
	('0c672dd6-427a-40e1-9dcf-c004fb4f88bf', 'b2c3d4e5-f6a7-48b9-b0c1-d2e3f4a5b6c7'),
	('5f9fc413-d318-4dfe-8da2-3cea5230260a', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0'),
	('5f9fc413-d318-4dfe-8da2-3cea5230260a', '97de20a9-3442-4adb-b83c-693df1a214a7'),
	('9b2e4ca4-6a43-4f6b-8934-fd5fdcf88823', 'c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8'),
	('9b2e4ca4-6a43-4f6b-8934-fd5fdcf88823', 'e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0');


--
-- Data for Name: smartject_industries; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."smartject_industries" ("smartject_id", "industry_id") VALUES
	('a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', '1f8f7c6a-9c5d-4b3e-8a7f-6d9c8b7a6f5e'),
	('b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', '4f1f0e9d-2f8f-7e6f-1c0d-9f2f1e0d9c8b'),
	('c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', '3f0e9d8c-1e7f-6d5f-0b9c-8f1e0d9c8b7a'),
	('d3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', '2e9f8d7b-0d6e-5c4f-9a8b-7e0d9c8b7a6f'),
	('e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', '5f2f1f0e-3f9f-8f7f-2d1e-0f3f2f1e0d9c'),
	('9187e65a-d9c5-4d8c-ab78-1c5859223998', '3f0e9d8c-1e7f-6d5f-0b9c-8f1e0d9c8b7a'),
	('9187e65a-d9c5-4d8c-ab78-1c5859223998', '0a11afde-2b73-4775-bc3a-9acb31dffd75'),
	('22b2a417-12d1-4ba7-bbee-0b770c0c3933', '5f2f1f0e-3f9f-8f7f-2d1e-0f3f2f1e0d9c'),
	('22b2a417-12d1-4ba7-bbee-0b770c0c3933', '1f8f7c6a-9c5d-4b3e-8a7f-6d9c8b7a6f5e'),
	('22b2a417-12d1-4ba7-bbee-0b770c0c3933', '2e9f8d7b-0d6e-5c4f-9a8b-7e0d9c8b7a6f'),
	('b762b8cb-0376-459a-a1d4-70df231c3526', '5f2f1f0e-3f9f-8f7f-2d1e-0f3f2f1e0d9c'),
	('b762b8cb-0376-459a-a1d4-70df231c3526', '1f8f7c6a-9c5d-4b3e-8a7f-6d9c8b7a6f5e'),
	('b762b8cb-0376-459a-a1d4-70df231c3526', '2e9f8d7b-0d6e-5c4f-9a8b-7e0d9c8b7a6f'),
	('f45fc70e-9d1e-4434-8478-e78a5ee07882', '1f8f7c6a-9c5d-4b3e-8a7f-6d9c8b7a6f5e'),
	('22c36698-1ea9-44d8-869c-32fcd6bbd52c', '1f8f7c6a-9c5d-4b3e-8a7f-6d9c8b7a6f5e'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '1f8f7c6a-9c5d-4b3e-8a7f-6d9c8b7a6f5e'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '2e9f8d7b-0d6e-5c4f-9a8b-7e0d9c8b7a6f'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '3f0e9d8c-1e7f-6d5f-0b9c-8f1e0d9c8b7a'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '4f1f0e9d-2f8f-7e6f-1c0d-9f2f1e0d9c8b'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '5f2f1f0e-3f9f-8f7f-2d1e-0f3f2f1e0d9c'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '13d884ee-0d06-4540-9297-bc969672a00e'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '54346636-cc6d-408b-97d8-53c555cb1931'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', 'ccf8cd01-c930-4d66-8a55-14737f4c4c81'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '049be708-f45b-4635-9350-22c1433dfc8e'),
	('b183ac06-c543-4af1-80e2-0a2adfadbd92', '1f8f7c6a-9c5d-4b3e-8a7f-6d9c8b7a6f5e'),
	('b183ac06-c543-4af1-80e2-0a2adfadbd92', '2e9f8d7b-0d6e-5c4f-9a8b-7e0d9c8b7a6f'),
	('43d93874-f4ea-415e-9e02-8c540df80af1', '049be708-f45b-4635-9350-22c1433dfc8e'),
	('43d93874-f4ea-415e-9e02-8c540df80af1', 'f4ec34d3-9253-4fe0-8569-edf342dca5a9'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', '1f8f7c6a-9c5d-4b3e-8a7f-6d9c8b7a6f5e'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', '2e9f8d7b-0d6e-5c4f-9a8b-7e0d9c8b7a6f'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', '3f0e9d8c-1e7f-6d5f-0b9c-8f1e0d9c8b7a'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', '4f1f0e9d-2f8f-7e6f-1c0d-9f2f1e0d9c8b'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', '5f2f1f0e-3f9f-8f7f-2d1e-0f3f2f1e0d9c'),
	('7a572550-5dee-41e2-b329-dba4338ddbec', '1f8f7c6a-9c5d-4b3e-8a7f-6d9c8b7a6f5e'),
	('bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', '1f8f7c6a-9c5d-4b3e-8a7f-6d9c8b7a6f5e'),
	('bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', '2e9f8d7b-0d6e-5c4f-9a8b-7e0d9c8b7a6f'),
	('bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', '3f0e9d8c-1e7f-6d5f-0b9c-8f1e0d9c8b7a'),
	('bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', '5f2f1f0e-3f9f-8f7f-2d1e-0f3f2f1e0d9c'),
	('bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', '4f1f0e9d-2f8f-7e6f-1c0d-9f2f1e0d9c8b'),
	('0c672dd6-427a-40e1-9dcf-c004fb4f88bf', '1f8f7c6a-9c5d-4b3e-8a7f-6d9c8b7a6f5e'),
	('0c672dd6-427a-40e1-9dcf-c004fb4f88bf', '2e9f8d7b-0d6e-5c4f-9a8b-7e0d9c8b7a6f');


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."tags" ("id", "name") VALUES
	('e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6', 'Innovation'),
	('f2a3b4c5-d6e7-48f9-f0a1-b2c3d4e5f6a7', 'Automation'),
	('a3b4c5d6-e7f8-49a0-a1b2-c3d4e5f6a7b8', 'Sustainability'),
	('b4c5d6e7-f8a9-40b1-b2c3-d4e5f6a7b8c9', 'Digital Transformation'),
	('c5d6e7f8-a9b0-41c2-c3d4-e5f6a7b8c9d0', 'Customer Experience');


--
-- Data for Name: smartject_tags; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."smartject_tags" ("smartject_id", "tag_id") VALUES
	('a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6'),
	('a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'f2a3b4c5-d6e7-48f9-f0a1-b2c3d4e5f6a7'),
	('b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'a3b4c5d6-e7f8-49a0-a1b2-c3d4e5f6a7b8'),
	('b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'b4c5d6e7-f8a9-40b1-b2c3-d4e5f6a7b8c9'),
	('c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'c5d6e7f8-a9b0-41c2-c3d4-e5f6a7b8c9d0'),
	('c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'b4c5d6e7-f8a9-40b1-b2c3-d4e5f6a7b8c9'),
	('d3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', 'f2a3b4c5-d6e7-48f9-f0a1-b2c3d4e5f6a7'),
	('d3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', 'e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6'),
	('e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', 'e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6'),
	('e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', 'b4c5d6e7-f8a9-40b1-b2c3-d4e5f6a7b8c9');


--
-- Data for Name: technologies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."technologies" ("id", "name") VALUES
	('f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1', 'Artificial Intelligence'),
	('a7b8c9d0-e1f2-43a4-a5b6-c7d8e9f0a1b2', 'Blockchain'),
	('b8c9d0e1-f2a3-44b5-b6c7-d8e9f0a1b2c3', 'Cloud Computing'),
	('c9d0e1f2-a3b4-45c6-c7d8-e9f0a1b2c3d4', 'Internet of Things'),
	('d0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5', 'Machine Learning'),
	('65011806-bd02-4de8-950e-ec9fc79e920f', 'Deep Learning'),
	('961a2e1d-9b1d-40a0-a6fc-a7414cc786df', 'Natural Language Processing'),
	('26de1f91-1192-47e6-a329-db3f15c16c63', 'Computer Vision'),
	('00ace63d-cb66-4613-a7b8-8cce3f90deb4', 'Robotic Process Automation'),
	('7bb4da74-a8cd-4ff9-b178-25f6ddc16c09', 'Smart Contracts'),
	('687ea0a9-6bf2-415b-ad73-956742b33d34', 'Edge Computing'),
	('12c4a0f2-c1dc-430f-9b3f-be011ab4b64a', 'Hybrid Cloud'),
	('c763d9c0-5d2a-4594-a210-8d28715b7330', 'Quantum Computing'),
	('0e931873-367d-4d9b-a108-6c245ad77f1a', 'Augmented Reality'),
	('910a9883-bb4f-4cbb-b0e2-0f12a0da9348', 'Virtual Reality'),
	('5e979289-cb87-4745-9b7b-82af1a93303a', 'Mixed Reality'),
	('e6dbe115-de76-4153-a491-e1decb030a7b', 'Big Data'),
	('dd9f5c1d-8c78-48b7-b1a0-864a2cd81512', 'Data Lakes'),
	('839e54aa-d584-478f-9f06-558c50e528e7', 'Data Warehousing'),
	('f0f89b9a-1860-43b4-b900-5f094abae72c', 'Cybersecurity'),
	('058c3d6d-6ea4-4b96-86cc-086030f89e8b', 'Zero Trust Architecture'),
	('5fa92366-00b8-4a8b-bae2-deb0585409fc', 'Multi-Factor Authentication'),
	('4a2e99ad-a9f0-475a-9b75-f7f7e0bbb5d7', 'Digital Twins'),
	('d2b6ce4a-f61c-467a-b00a-44bf8923fd9b', 'DevOps'),
	('4a4674e6-3b9f-4c30-a504-e26f0d7d038a', 'MLOps'),
	('8d7b62f2-a5ea-49c2-8ba7-3d843a42914d', 'AIoT'),
	('acdd545a-a24b-4d07-94b2-665265ff0f71', '5G Connectivity'),
	('778ee164-6154-4b84-b70f-1a833051812b', 'Autonomous Systems'),
	('9e22ea3b-aedc-4ce6-a6ab-227be2ade27c', 'API Integration'),
	('8872e0b7-b2f9-4810-9f05-1bcf7df254d2', 'Microservices Architecture'),
	('614ed20f-5731-4f29-a48e-7adfbfd76b57', 'Serverless Computing'),
	('b67fa3e2-8a14-47d9-b2a9-a200b3d0bbf4', 'No-Code Platforms'),
	('13b09a30-a162-483e-aa2c-f87693c61036', 'Low-Code Platforms'),
	('526eda1e-0bce-41b6-b1eb-7d0dff6cdd41', 'Predictive Analytics'),
	('85367e0c-55ac-4342-a777-b6bc9fe813d2', 'Prescriptive Analytics'),
	('d58c2b67-d96e-4eb4-ab6b-aac8f1c064f0', 'Explainable AI'),
	('8ec854fd-dd8a-4e4d-82e2-861fbf80da46', 'Federated Learning'),
	('97231d60-52a6-46a6-94bd-c6b49703578d', 'Synthetic Data'),
	('96b5226d-a28c-4637-a1c0-4e350c0e9c11', 'Generative AI'),
	('6043cf7d-1e59-475a-bcf8-4aab33a37c20', 'LLMs'),
	('cec59baa-18a1-443a-8e68-f517b87523a2', 'Chatbots'),
	('50b1892d-878e-45e9-8dbb-4751a85614b6', 'Speech Recognition'),
	('a70b2563-7753-4e04-b705-bc933d13a521', 'Computer-Aided Design'),
	('bbd05202-4c09-4868-8335-773d5e356690', 'Intelligent Automation'),
	('263b06c8-a767-42ea-8b1c-b3b354b90638', 'Real-Time Analytics'),
	('c5fe7eb0-a826-4436-aea8-59fd0ce9e07e', 'Data Fabric'),
	('97e23c2c-b244-4cd2-9c83-f92e3214f3ef', 'Semantic Search'),
	('f20a5547-f55c-4003-93a8-b0d1ae0259b6', 'Reinforcement Learning'),
	('557e0ac8-d00b-4ff4-a8a0-663ce139341b', 'Privacy-Preserving Machine Learning'),
	('f48a7881-5414-409c-a28f-2be72cae5a60', 'Homomorphic Encryption'),
	('55c4c027-da0f-4dc1-8a29-7eee53ffcf16', 'Edge AI'),
	('c9c53ee4-04a6-4847-8759-dc04cbd1e77c', 'Neuromorphic Computing'),
	('a5f9e187-b7d4-4cd4-9f39-bb35f4a75293', 'Bioinformatics'),
	('9979b01c-d343-46c5-9d5e-38b75b77c802', 'Digital Biomarkers'),
	('906066e8-0c77-4bb8-a1cf-b8fef776639c', 'Conversational AI'),
	('61211051-cf90-42be-9276-ccb589fffcfc', 'Emotion AI'),
	('8701f45a-141c-4837-9181-ade0a547fe03', 'AI Governance'),
	('0ad529c1-7726-4c1f-b590-04a6da6fda10', 'Model Monitoring'),
	('76cb2f84-037f-41ff-832c-b654cf8fbcda', 'AI Ethics'),
	('fc28717d-21b0-440e-ab8e-0b2d4db65ccb', 'Data Annotation Tools'),
	('4c1e3460-e800-47a7-afba-12ed81df4284', 'Knowledge Graphs'),
	('17aeb0d2-86a6-46a7-9dd8-0c03bd57ef11', 'Graph Neural Networks'),
	('51ec32e8-a5f6-45b9-b2bc-ad1b9a6aeb09', 'Recommendation Systems'),
	('c9007ded-edc9-4425-be9c-3b39c16b6d7d', 'Data Lineage'),
	('00b82a0b-ab09-4a33-960b-bfc44b9412d8', 'Feature Stores'),
	('3c719efc-ff0e-40d8-a50c-7dcb5ce731b6', 'Cloud-Native Applications'),
	('ef23a4a6-f92a-4807-b6d6-6b212512c222', 'Containerization'),
	('483d8be0-09a9-42b9-8b12-e4e7eb03f1f4', 'Kubernetes'),
	('77d29d3b-e867-4a3c-9b2e-73c49931630b', 'Docker'),
	('d01fec46-d7f1-4fb3-95ac-8a8bac45f0cc', 'Infrastructure as Code'),
	('7d210b20-5bdb-4c34-9ffc-8e95ea5b7625', 'CI/CD Pipelines'),
	('6f1babab-1993-49b2-9d0b-f02d44ad64d5', 'Observability Tools'),
	('326f82bd-9244-43ed-b09c-55635793b5b9', 'Application Performance Monitoring'),
	('a0a2726a-c126-4ea4-9678-eb526fa12159', 'Event-Driven Architecture'),
	('0e731167-d816-4adc-803e-09f0599bcf00', 'Data Streaming'),
	('ae1c0b07-d5e4-494f-818d-c9062a0bf01f', 'Apache Kafka'),
	('75d828dc-2aeb-4e95-ba07-45d80931914a', 'Data Mesh'),
	('8fc0a789-0c68-47cf-ac12-4161ff52b57e', 'API Gateways'),
	('11fa70c4-711e-42df-9d29-32486c810088', 'WebAssembly'),
	('4a1cb338-264b-49e1-a9a4-c02f76f51e4f', 'Edge Deployment'),
	('5333f40b-69a6-4735-830e-f39da8826ecc', 'AI Chipsets'),
	('8ab22eb5-08ee-472b-b9dc-a515e063117e', 'Tensor Processing Units'),
	('6f65fe7a-f9ec-4efc-b5e8-28f61b4ee5ec', 'FPGA'),
	('7939d3a9-3ff5-40bb-90cb-8015d73ed58e', 'Digital Identity Verification'),
	('df2493ce-bd56-4e5a-b293-66102e497395', 'Voice Biometrics'),
	('ebc00469-321a-4ee0-a120-dbd25ccd2843', '3D Modeling'),
	('fb5e91e3-6d46-461a-8bae-4ccc97ee6d85', 'Human-Centered AI'),
	('d4fe9a60-e7ac-4c19-8fed-24be0a049374', 'Multimodal AI'),
	('2f19e979-bbc7-4208-b921-39bf3d259860', 'AutoML'),
	('abecdd8b-5cf3-487f-b94e-7ac4ab83d237', 'Simulation Technology'),
	('50600b65-3e24-4f6b-9a1a-933c48c365c4', 'Self-Healing Systems'),
	('978fda93-5ccf-4e52-bb7b-ea04d838a4ba', 'Responsible AI'),
	('5f5582ba-b180-4c9e-afdb-5571370c57a1', 'AI Safety'),
	('b070adfa-2136-48a5-b173-7912f1f3f443', 'Vision Transformers'),
	('c8b89aa8-ac0f-4bc2-8c32-5c75e0dee096', 'Diffusion Models'),
	('5a804273-f127-4b2b-9575-0ff54cf6d3f2', 'Foundational Models'),
	('359da954-0e05-4c47-b468-3727938d652c', 'Open Source LLMs');


--
-- Data for Name: smartject_technologies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."smartject_technologies" ("smartject_id", "technology_id") VALUES
	('a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'a7b8c9d0-e1f2-43a4-a5b6-c7d8e9f0a1b2'),
	('c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'c9d0e1f2-a3b4-45c6-c7d8-e9f0a1b2c3d4'),
	('c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('d3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('d3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', 'b8c9d0e1-f2a3-44b5-b6c7-d8e9f0a1b2c3'),
	('e099c354-1819-4130-8482-57b240b814e2', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('e099c354-1819-4130-8482-57b240b814e2', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('e099c354-1819-4130-8482-57b240b814e2', '961a2e1d-9b1d-40a0-a6fc-a7414cc786df'),
	('e099c354-1819-4130-8482-57b240b814e2', 'b8c9d0e1-f2a3-44b5-b6c7-d8e9f0a1b2c3'),
	('e099c354-1819-4130-8482-57b240b814e2', 'e6dbe115-de76-4153-a491-e1decb030a7b'),
	('9187e65a-d9c5-4d8c-ab78-1c5859223998', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('9187e65a-d9c5-4d8c-ab78-1c5859223998', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('9187e65a-d9c5-4d8c-ab78-1c5859223998', '65011806-bd02-4de8-950e-ec9fc79e920f'),
	('22b2a417-12d1-4ba7-bbee-0b770c0c3933', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('22b2a417-12d1-4ba7-bbee-0b770c0c3933', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('b762b8cb-0376-459a-a1d4-70df231c3526', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('b762b8cb-0376-459a-a1d4-70df231c3526', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('f45fc70e-9d1e-4434-8478-e78a5ee07882', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('f45fc70e-9d1e-4434-8478-e78a5ee07882', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('f45fc70e-9d1e-4434-8478-e78a5ee07882', '65011806-bd02-4de8-950e-ec9fc79e920f'),
	('f45fc70e-9d1e-4434-8478-e78a5ee07882', '961a2e1d-9b1d-40a0-a6fc-a7414cc786df'),
	('f45fc70e-9d1e-4434-8478-e78a5ee07882', '26de1f91-1192-47e6-a329-db3f15c16c63'),
	('22c36698-1ea9-44d8-869c-32fcd6bbd52c', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('22c36698-1ea9-44d8-869c-32fcd6bbd52c', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('22c36698-1ea9-44d8-869c-32fcd6bbd52c', '961a2e1d-9b1d-40a0-a6fc-a7414cc786df'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', '65011806-bd02-4de8-950e-ec9fc79e920f'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', '961a2e1d-9b1d-40a0-a6fc-a7414cc786df'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', '26de1f91-1192-47e6-a329-db3f15c16c63'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', 'c9d0e1f2-a3b4-45c6-c7d8-e9f0a1b2c3d4'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', 'e6dbe115-de76-4153-a491-e1decb030a7b'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', 'dd9f5c1d-8c78-48b7-b1a0-864a2cd81512'),
	('4606cc48-7c07-46da-adee-5582b5449b3f', '839e54aa-d584-478f-9f06-558c50e528e7'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '65011806-bd02-4de8-950e-ec9fc79e920f'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '961a2e1d-9b1d-40a0-a6fc-a7414cc786df'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '26de1f91-1192-47e6-a329-db3f15c16c63'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '00ace63d-cb66-4613-a7b8-8cce3f90deb4'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '7bb4da74-a8cd-4ff9-b178-25f6ddc16c09'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '687ea0a9-6bf2-415b-ad73-956742b33d34'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '12c4a0f2-c1dc-430f-9b3f-be011ab4b64a'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', 'c763d9c0-5d2a-4594-a210-8d28715b7330'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '0e931873-367d-4d9b-a108-6c245ad77f1a'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '910a9883-bb4f-4cbb-b0e2-0f12a0da9348'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', 'e6dbe115-de76-4153-a491-e1decb030a7b'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', 'dd9f5c1d-8c78-48b7-b1a0-864a2cd81512'),
	('1dbe2241-c5cc-4b01-85c0-5486067c53c2', '839e54aa-d584-478f-9f06-558c50e528e7'),
	('b183ac06-c543-4af1-80e2-0a2adfadbd92', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('b183ac06-c543-4af1-80e2-0a2adfadbd92', 'a7b8c9d0-e1f2-43a4-a5b6-c7d8e9f0a1b2'),
	('43d93874-f4ea-415e-9e02-8c540df80af1', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('43d93874-f4ea-415e-9e02-8c540df80af1', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('469065e3-22a3-4ce8-a5da-51cdf23c4b0c', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('469065e3-22a3-4ce8-a5da-51cdf23c4b0c', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('469065e3-22a3-4ce8-a5da-51cdf23c4b0c', 'b8c9d0e1-f2a3-44b5-b6c7-d8e9f0a1b2c3'),
	('469065e3-22a3-4ce8-a5da-51cdf23c4b0c', 'e6dbe115-de76-4153-a491-e1decb030a7b'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', 'b8c9d0e1-f2a3-44b5-b6c7-d8e9f0a1b2c3'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', 'e6dbe115-de76-4153-a491-e1decb030a7b'),
	('248c43c5-de9f-4904-9b64-697a180f1a58', 'dd9f5c1d-8c78-48b7-b1a0-864a2cd81512'),
	('7a572550-5dee-41e2-b329-dba4338ddbec', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'b8c9d0e1-f2a3-44b5-b6c7-d8e9f0a1b2c3'),
	('15e85de3-1eb2-4e85-89e5-e894b9801cdd', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('15e85de3-1eb2-4e85-89e5-e894b9801cdd', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('15e85de3-1eb2-4e85-89e5-e894b9801cdd', '65011806-bd02-4de8-950e-ec9fc79e920f'),
	('5f9fc413-d318-4dfe-8da2-3cea5230260a', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('5f9fc413-d318-4dfe-8da2-3cea5230260a', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5'),
	('9b2e4ca4-6a43-4f6b-8934-fd5fdcf88823', 'f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1'),
	('9b2e4ca4-6a43-4f6b-8934-fd5fdcf88823', 'd0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5');


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."votes" ("id", "user_id", "smartject_id", "vote_type", "created_at") VALUES
	('a1b2c3d4-e5f6-47a8-a9b0-c1d2e3f4a5b6', 'd9d046e5-67d7-4a05-b4e4-84f1f1e9149e', 'a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'believe', '2025-05-07 20:16:51.395939+00'),
	('b2c3d4e5-f6a7-48b9-b0c1-d2e3f4a5b6c7', 'c2c14c7a-5c23-4fc2-8b3d-3121d6d19f8c', 'a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'believe', '2025-05-08 20:16:51.395939+00'),
	('c3d4e5f6-a7b8-49c0-c1d2-e3f4a5b6c7d8', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'believe', '2025-05-09 20:16:51.395939+00'),
	('d4e5f6a7-b8c9-40d1-d2e3-f4a5b6c7d8e9', '550e8400-e29b-41d4-a716-446655440000', 'a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'need', '2025-05-10 20:16:51.395939+00'),
	('e5f6a7b8-c9d0-41e2-e3f4-a5b6c7d8e9f0', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'a0b1c2d3-e4f5-46a7-a8b9-c0d1e2f3a4b5', 'provide', '2025-05-11 20:16:51.395939+00'),
	('f6a7b8c9-d0e1-42f3-f4a5-b6c7d8e9f0a1', 'd9d046e5-67d7-4a05-b4e4-84f1f1e9149e', 'b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'believe', '2025-05-07 20:16:51.395939+00'),
	('a7b8c9d0-e1f2-43a4-a5b6-c7d8e9f0a1b2', 'c2c14c7a-5c23-4fc2-8b3d-3121d6d19f8c', 'b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'need', '2025-05-08 20:16:51.395939+00'),
	('b8c9d0e1-f2a3-44b5-b6c7-d8e9f0a1b2c3', '550e8400-e29b-41d4-a716-446655440000', 'b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'provide', '2025-05-09 20:16:51.395939+00'),
	('c9d0e1f2-a3b4-45c6-c7d8-e9f0a1b2c3d4', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'believe', '2025-05-07 20:16:51.395939+00'),
	('d0e1f2a3-b4c5-46d7-d8e9-f0a1b2c3d4e5', '550e8400-e29b-41d4-a716-446655440000', 'c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'need', '2025-05-08 20:16:51.395939+00'),
	('e1f2a3b4-c5d6-47e8-e9f0-a1b2c3d4e5f6', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'c2d3e4f5-a6b7-48c9-c0d1-e2f3a4b5c6d7', 'need', '2025-05-09 20:16:51.395939+00'),
	('f2a3b4c5-d6e7-48f9-f0a1-b2c3d4e5f6a7', 'd9d046e5-67d7-4a05-b4e4-84f1f1e9149e', 'd3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', 'believe', '2025-05-07 20:16:51.395939+00'),
	('a3b4c5d6-e7f8-49a0-a1b2-c3d4e5f6a7b8', 'c2c14c7a-5c23-4fc2-8b3d-3121d6d19f8c', 'd3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', 'believe', '2025-05-08 20:16:51.395939+00'),
	('b4c5d6e7-f8a9-40b1-b2c3-d4e5f6a7b8c9', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'd3e4f5a6-b7c8-49d0-d1e2-f3a4b5c6d7e8', 'provide', '2025-05-09 20:16:51.395939+00'),
	('c5d6e7f8-a9b0-41c2-c3d4-e5f6a7b8c9d0', '550e8400-e29b-41d4-a716-446655440000', 'e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', 'believe', '2025-05-07 20:16:51.395939+00'),
	('d6e7f8a9-b0c1-42d3-d4e5-f6a7b8c9d0e1', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', 'need', '2025-05-08 20:16:51.395939+00'),
	('e7f8a9b0-c1d2-43e4-e5f6-a7b8c9d0e1f2', 'd9d046e5-67d7-4a05-b4e4-84f1f1e9149e', 'e4f5a6b7-c8d9-40e1-e2f3-a4b5c6d7e8f9', 'provide', '2025-05-09 20:16:51.395939+00'),
	('1b95d5c1-1b15-4986-86ca-5f58e3319e30', 'f80838d7-5c01-4fb1-906d-6de22980b011', 'b1c2d3e4-f5a6-47b8-b9c0-d1e2f3a4b5c6', 'believe', '2025-05-23 15:54:54.935465+00'),
	('f5a7f12d-24d5-4ae2-a7b1-106a96dea181', '2c1979f5-ca56-4d24-812c-1aadb8409e88', '7a572550-5dee-41e2-b329-dba4338ddbec', 'believe', '2025-05-23 15:58:55.622549+00'),
	('3ef74213-db5f-44ee-8d5c-a16bee2a6694', 'f80838d7-5c01-4fb1-906d-6de22980b011', '7a572550-5dee-41e2-b329-dba4338ddbec', 'believe', '2025-05-25 17:26:41.352174+00'),
	('a8685138-b1d3-48e6-991e-9cf2f0a6553b', 'f80838d7-5c01-4fb1-906d-6de22980b011', 'bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'believe', '2025-05-25 17:42:40.95564+00'),
	('35d49443-b554-4bfd-8939-15d62c851c1e', '2c1979f5-ca56-4d24-812c-1aadb8409e88', 'bf6350b2-19f2-4dee-ae76-0d9fca1a9a0c', 'believe', '2025-05-30 00:23:46.334088+00'),
	('ceae8038-5412-4768-ab3b-e95f7733aeaa', 'f80838d7-5c01-4fb1-906d-6de22980b011', '1dbe2241-c5cc-4b01-85c0-5486067c53c2', 'need', '2025-05-31 08:29:28.128306+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('proposal-uploads', 'proposal-uploads', NULL, '2025-05-30 15:05:28.762171+00', '2025-05-30 15:05:28.762171+00', false, false, 10485760, NULL, NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('6d6e03a3-f136-4deb-aa1c-08a5a101f4d2', 'proposal-uploads', 'proposals/cfa2eea1-cfea-434c-be67-300d82025e35/1749035023233-2j2d2f1d1j1o_2j.2j._2u1a1t1f1n1a1t1j1y1f1s1l1j1f_1p1s1o1p1c2c_1n1a1z1j1o1o1p1d1p_1p1b1u1y1f1o1j2g_1j_1q1r1p1d1o1p1i1j1r1p1c1a1o1j2g._2014.pdf', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', '2025-06-04 11:03:45.057917+00', '2025-06-04 11:03:45.057917+00', '2025-06-04 11:03:45.057917+00', '{"eTag": "\"01c05c8a9fd2d374557db3a589e5b962\"", "size": 2149621, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-06-04T11:03:45.000Z", "contentLength": 2149621, "httpStatusCode": 200}', 'e1341a9f-699e-4f4b-a54e-a68f825f0824', 'ba1aef95-db05-4ecd-9cf6-1819fe7ee819', '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 159, true);


--
-- PostgreSQL database dump complete
--

RESET ALL;
