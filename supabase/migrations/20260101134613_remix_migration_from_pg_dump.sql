CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'buyer',
    'supplier',
    'admin'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    image_url text,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: disputes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disputes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    complainant_id uuid NOT NULL,
    respondent_id uuid NOT NULL,
    order_id uuid,
    subject text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    resolution text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    document_type text NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: inquiries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inquiries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    buyer_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    product_id uuid,
    message text NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    inquiry_id uuid,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    supplier_id uuid NOT NULL,
    category_id uuid,
    name text NOT NULL,
    description text,
    specifications jsonb,
    price numeric(10,2),
    moq integer DEFAULT 1 NOT NULL,
    unit text,
    images text[],
    is_approved boolean DEFAULT false,
    is_active boolean DEFAULT true,
    views integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    phone text,
    company_name text,
    company_description text,
    address text,
    city text,
    state text,
    country text,
    pincode text,
    gst_number text,
    pan_number text,
    is_verified boolean DEFAULT false
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    buyer_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    product_id uuid,
    rating integer NOT NULL,
    review_text text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: rfq_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rfq_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    rfq_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    message text NOT NULL,
    quoted_price numeric(10,2),
    delivery_time text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: rfqs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rfqs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    buyer_id uuid NOT NULL,
    category_id uuid,
    title text NOT NULL,
    description text NOT NULL,
    quantity integer,
    unit text,
    target_price numeric(10,2),
    location text,
    deadline timestamp with time zone,
    status text DEFAULT 'open'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: saved_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: saved_suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saved_suppliers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    buyer_id uuid NOT NULL,
    supplier_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: inquiries inquiries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: rfq_responses rfq_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_responses
    ADD CONSTRAINT rfq_responses_pkey PRIMARY KEY (id);


--
-- Name: rfqs rfqs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT rfqs_pkey PRIMARY KEY (id);


--
-- Name: saved_products saved_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_products
    ADD CONSTRAINT saved_products_pkey PRIMARY KEY (id);


--
-- Name: saved_products saved_products_user_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_products
    ADD CONSTRAINT saved_products_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Name: saved_suppliers saved_suppliers_buyer_id_supplier_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_suppliers
    ADD CONSTRAINT saved_suppliers_buyer_id_supplier_id_key UNIQUE (buyer_id, supplier_id);


--
-- Name: saved_suppliers saved_suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_suppliers
    ADD CONSTRAINT saved_suppliers_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: profiles on_profile_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: disputes update_disputes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: documents update_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- Name: inquiries inquiries_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: inquiries inquiries_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: inquiries inquiries_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inquiries
    ADD CONSTRAINT inquiries_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_inquiry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_inquiry_id_fkey FOREIGN KEY (inquiry_id) REFERENCES public.inquiries(id) ON DELETE CASCADE;


--
-- Name: messages messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: reviews reviews_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: rfq_responses rfq_responses_rfq_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_responses
    ADD CONSTRAINT rfq_responses_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES public.rfqs(id) ON DELETE CASCADE;


--
-- Name: rfq_responses rfq_responses_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfq_responses
    ADD CONSTRAINT rfq_responses_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: rfqs rfqs_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT rfqs_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: rfqs rfqs_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rfqs
    ADD CONSTRAINT rfqs_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: saved_products saved_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_products
    ADD CONSTRAINT saved_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: saved_products saved_products_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_products
    ADD CONSTRAINT saved_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: saved_suppliers saved_suppliers_buyer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_suppliers
    ADD CONSTRAINT saved_suppliers_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: saved_suppliers saved_suppliers_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saved_suppliers
    ADD CONSTRAINT saved_suppliers_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: disputes Admins can manage all disputes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all disputes" ON public.disputes USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: products Admins can manage all products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all products" ON public.products USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: categories Admins can manage categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage categories" ON public.categories USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: documents Admins can update documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update documents" ON public.documents FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: documents Admins can view all documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all documents" ON public.documents FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: products Anyone can view approved products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view approved products" ON public.products FOR SELECT USING (((is_approved = true) AND (is_active = true)));


--
-- Name: categories Anyone can view categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);


--
-- Name: rfqs Anyone can view open RFQs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view open RFQs" ON public.rfqs FOR SELECT USING ((status = 'open'::text));


--
-- Name: reviews Anyone can view reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);


--
-- Name: profiles Anyone can view supplier profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view supplier profiles" ON public.profiles FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = profiles.id) AND (user_roles.role = 'supplier'::public.app_role) AND (profiles.is_verified = true)))));


--
-- Name: user_roles Anyone can view supplier roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view supplier roles" ON public.user_roles FOR SELECT USING ((role = 'supplier'::public.app_role));


--
-- Name: rfqs Buyers can create RFQs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Buyers can create RFQs" ON public.rfqs FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'buyer'::public.app_role) AND (buyer_id = auth.uid())));


--
-- Name: inquiries Buyers can create inquiries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Buyers can create inquiries" ON public.inquiries FOR INSERT WITH CHECK ((buyer_id = auth.uid()));


--
-- Name: reviews Buyers can create reviews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Buyers can create reviews" ON public.reviews FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'buyer'::public.app_role) AND (buyer_id = auth.uid())));


--
-- Name: saved_suppliers Buyers can manage saved suppliers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Buyers can manage saved suppliers" ON public.saved_suppliers USING ((buyer_id = auth.uid()));


--
-- Name: rfqs Buyers can update their RFQs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Buyers can update their RFQs" ON public.rfqs FOR UPDATE USING ((buyer_id = auth.uid()));


--
-- Name: rfqs Buyers can view their RFQs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Buyers can view their RFQs" ON public.rfqs FOR SELECT USING ((buyer_id = auth.uid()));


--
-- Name: rfq_responses RFQ owners can view responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "RFQ owners can view responses" ON public.rfq_responses FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.rfqs
  WHERE ((rfqs.id = rfq_responses.rfq_id) AND (rfqs.buyer_id = auth.uid())))));


--
-- Name: products Suppliers can create products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Suppliers can create products" ON public.products FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'supplier'::public.app_role) AND (supplier_id = auth.uid())));


--
-- Name: rfq_responses Suppliers can create responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Suppliers can create responses" ON public.rfq_responses FOR INSERT WITH CHECK ((public.has_role(auth.uid(), 'supplier'::public.app_role) AND (supplier_id = auth.uid())));


--
-- Name: products Suppliers can update their products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Suppliers can update their products" ON public.products FOR UPDATE USING ((supplier_id = auth.uid()));


--
-- Name: products Suppliers can view their own products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Suppliers can view their own products" ON public.products FOR SELECT USING ((supplier_id = auth.uid()));


--
-- Name: rfq_responses Suppliers can view their responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Suppliers can view their responses" ON public.rfq_responses FOR SELECT USING ((supplier_id = auth.uid()));


--
-- Name: disputes Users can create disputes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create disputes" ON public.disputes FOR INSERT WITH CHECK ((complainant_id = auth.uid()));


--
-- Name: documents Users can delete their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING ((user_id = auth.uid()));


--
-- Name: documents Users can insert their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own documents" ON public.documents FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = id));


--
-- Name: user_roles Users can insert their own role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own role" ON public.user_roles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: saved_products Users can manage their saved products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their saved products" ON public.saved_products USING ((user_id = auth.uid()));


--
-- Name: messages Users can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK ((sender_id = auth.uid()));


--
-- Name: inquiries Users can update their inquiries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their inquiries" ON public.inquiries FOR UPDATE USING (((buyer_id = auth.uid()) OR (supplier_id = auth.uid())));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- Name: user_roles Users can update their own role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own role" ON public.user_roles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: disputes Users can view their disputes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their disputes" ON public.disputes FOR SELECT USING (((complainant_id = auth.uid()) OR (respondent_id = auth.uid())));


--
-- Name: inquiries Users can view their inquiries; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their inquiries" ON public.inquiries FOR SELECT USING (((buyer_id = auth.uid()) OR (supplier_id = auth.uid())));


--
-- Name: messages Users can view their messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (((sender_id = auth.uid()) OR (receiver_id = auth.uid())));


--
-- Name: documents Users can view their own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own documents" ON public.documents FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: disputes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: inquiries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: rfq_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rfq_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: rfqs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;

--
-- Name: saved_suppliers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saved_suppliers ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;