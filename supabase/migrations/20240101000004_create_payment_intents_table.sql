-- Criar tabela para auditoria de Payment Intents do Stripe
CREATE TABLE IF NOT EXISTS payment_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_payment_intent_id TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    customer_email TEXT,
    customer_name TEXT,
    booking_id UUID REFERENCES bookings(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_stripe_id ON payment_intents(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_created_at ON payment_intents(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_intents_booking_id ON payment_intents(booking_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção via Edge Functions
CREATE POLICY "Allow service role to manage payment_intents" ON payment_intents
    FOR ALL USING (auth.role() = 'service_role');

-- Política para usuários autenticados visualizarem seus próprios pagamentos
CREATE POLICY "Users can view their own payment_intents" ON payment_intents
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM bookings 
            WHERE bookings.id = payment_intents.booking_id 
            AND bookings.user_id = auth.uid()
        )
    );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_payment_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_payment_intents_updated_at
    BEFORE UPDATE ON payment_intents
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_intents_updated_at();

-- Comentários para documentação
COMMENT ON TABLE payment_intents IS 'Auditoria de Payment Intents do Stripe';
COMMENT ON COLUMN payment_intents.stripe_payment_intent_id IS 'ID do Payment Intent no Stripe';
COMMENT ON COLUMN payment_intents.amount IS 'Valor em centavos';
COMMENT ON COLUMN payment_intents.currency IS 'Moeda do pagamento';
COMMENT ON COLUMN payment_intents.status IS 'Status do pagamento no Stripe';
COMMENT ON COLUMN payment_intents.metadata IS 'Metadados adicionais do pagamento';
COMMENT ON COLUMN payment_intents.booking_id IS 'Referência para a reserva associada'; 