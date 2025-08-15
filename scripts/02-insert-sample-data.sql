-- Insertar datos de ejemplo para probar el sistema

-- Inventario de ejemplo
INSERT INTO inventory (name, category, brand, model, price, stock, min_stock, description) VALUES
('Pantalla iPhone 12', 'pantalla', 'Apple', 'iPhone 12', 150.00, 10, 3, 'Pantalla OLED original'),
('Batería Samsung A52', 'bateria', 'Samsung', 'Galaxy A52', 25.00, 15, 5, 'Batería de litio 4000mAh'),
('Cargador USB-C', 'accesorio', 'Universal', 'USB-C', 8.00, 50, 10, 'Cable cargador USB-C 1m'),
('Pantalla Xiaomi Redmi Note 10', 'pantalla', 'Xiaomi', 'Redmi Note 10', 45.00, 8, 3, 'Pantalla LCD con touch'),
('Batería iPhone 11', 'bateria', 'Apple', 'iPhone 11', 35.00, 12, 4, 'Batería original Apple');

-- Trabajo de ejemplo
INSERT INTO jobs (customer_name, customer_phone, device_brand, device_model, problem_description, status, labor_cost, total_cost) VALUES
('Juan Pérez', '+1234567890', 'Apple', 'iPhone 12', 'Pantalla rota, no responde al touch', 'completado', 50.00, 200.00),
('María García', '+0987654321', 'Samsung', 'Galaxy A52', 'Batería se agota muy rápido', 'en_proceso', 30.00, 55.00);
