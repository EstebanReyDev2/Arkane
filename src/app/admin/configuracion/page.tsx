'use client'

import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/src/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/src/components/ui/card';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Switch } from '@/src/components/ui/switch';
import { Badge } from '@/src/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/src/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/src/components/ui/table';
import { 
  Plus, 
  Trash2, 
  Save, 
  Upload, 
  CreditCard, 
  Truck, 
  Megaphone, 
  Settings, 
  Globe,
  X,
  Check
} from 'lucide-react';
import { toast } from '@/src/hooks/use-toast';
import { getStoreConfig, updateStoreConfig, StoreConfig } from '@/src/lib/firebase/admin-queries';
import { cn } from '@/src/lib/utils';
import Image from 'next/image';

const DEFAULT_CONFIG: StoreConfig = {
  name: 'NEXUS Commerce',
  email: 'hola@nexus.com',
  phone: '+54 11 1234-5678',
  currency: 'ARS',
  freeShippingThreshold: 50000,
  shippingZones: [
    { id: '1', name: 'CABA', time: '24-48hs', cost: 0 },
    { id: '2', name: 'GBA', time: '2-3 días', cost: 2500 },
    { id: '3', name: 'Interior', time: '3-5 días', cost: 3500 },
  ],
  paymentMethods: [
    { id: 'cards', name: 'Tarjetas de crédito/débito', isActive: true, installments: [1, 3, 6] },
    { id: 'mp', name: 'Mercado Pago', isActive: true },
    { id: 'transfer', name: 'Transferencia bancaria', isActive: false },
  ],
  announcementBar: {
    isActive: true,
    messages: ['ENVÍO GRATIS EN COMPRAS SUPERIORES A $50.000', '3 CUOTAS SIN INTERÉS CON TODAS LAS TARJETAS'],
    backgroundColor: '#0D0D0D',
    textColor: '#FAFAFA'
  }
};

export default function ConfigurationPage() {
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await getStoreConfig();
        if (data) setConfig(data);
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateStoreConfig(config);
      toast({ title: "✅ Configuración guardada correctamente" });
    } catch (error) {
      toast({ title: "Error al guardar la configuración", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (path: string, value: any) => {
    const keys = path.split('.');
    setConfig(prev => {
      const newConfig = { ...prev };
      let current: any = newConfig;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  if (loading) {
    return <div className="p-12 text-center text-[#71717A]">Cargando configuración...</div>;
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[24px] font-bold text-[#18181B] tracking-tight">Configuración</h2>
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#71717A]">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#18181B]">Configuración</span>
          </div>
        </div>
        <Button 
          className="bg-[#0D0D0D] text-white h-11 px-8 font-bold uppercase tracking-widest text-[12px] gap-2"
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white border border-[#E4E4E7] p-1 h-12 w-full justify-start overflow-x-auto no-scrollbar">
          <TabsTrigger value="general" className="px-6 gap-2 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">
            <Globe size={16} />
            General
          </TabsTrigger>
          <TabsTrigger value="envios" className="px-6 gap-2 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">
            <Truck size={16} />
            Envíos
          </TabsTrigger>
          <TabsTrigger value="pagos" className="px-6 gap-2 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">
            <CreditCard size={16} />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="anuncios" className="px-6 gap-2 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">
            <Megaphone size={16} />
            Anuncios
          </TabsTrigger>
          <TabsTrigger value="avanzado" className="px-6 gap-2 data-[state=active]:bg-[#F4F4F5] data-[state=active]:text-[#18181B]">
            <Settings size={16} />
            Avanzado
          </TabsTrigger>
        </TabsList>

        {/* TAB: GENERAL */}
        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-[#E4E4E7] shadow-sm">
              <CardHeader className="p-6 border-b border-[#F4F4F5]">
                <CardTitle className="text-[16px] font-bold">Información de la tienda</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold">Nombre de la tienda</Label>
                    <Input 
                      value={config.name} 
                      onChange={(e) => updateField('name', e.target.value)}
                      className="h-10 border-[#E4E4E7]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold">Email de contacto</Label>
                    <Input 
                      type="email" 
                      value={config.email} 
                      onChange={(e) => updateField('email', e.target.value)}
                      className="h-10 border-[#E4E4E7]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold">Teléfono</Label>
                    <Input 
                      value={config.phone} 
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="h-10 border-[#E4E4E7]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold">Moneda principal</Label>
                    <Select value={config.currency} onValueChange={(v) => updateField('currency', v)}>
                      <SelectTrigger className="h-10 border-[#E4E4E7]">
                        <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                        <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E4E4E7] shadow-sm">
              <CardHeader className="p-6 border-b border-[#F4F4F5]">
                <CardTitle className="text-[16px] font-bold">Logo & Favicon</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="space-y-4">
                  <Label className="text-[13px] font-bold">Logo de la tienda</Label>
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-[#E4E4E7] rounded-xl bg-[#F9F9FB]">
                    <div className="relative w-32 h-12 bg-white rounded border border-[#E4E4E7] flex items-center justify-center overflow-hidden">
                      {config.logo ? (
                        <Image src={config.logo} alt="Logo" fill className="object-contain p-2" />
                      ) : (
                        <span className="text-[14px] font-black italic tracking-tighter">NEXUS</span>
                      )}
                    </div>
                    <Button variant="outline" className="h-9 gap-2 text-[11px] font-bold uppercase tracking-wider border-[#E4E4E7]">
                      <Upload size={14} />
                      Subir logo
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-[13px] font-bold">Favicon</Label>
                  <div className="flex items-center gap-4 p-4 border border-[#E4E4E7] rounded-xl bg-[#F9F9FB]">
                    <div className="w-10 h-10 bg-white rounded border border-[#E4E4E7] flex items-center justify-center">
                      <span className="text-[14px] font-black">N</span>
                    </div>
                    <Button variant="outline" className="h-9 gap-2 text-[11px] font-bold uppercase tracking-wider border-[#E4E4E7]">
                      Subir favicon
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: ENVÍOS */}
        <TabsContent value="envios">
          <div className="space-y-6">
            <Card className="border-[#E4E4E7] shadow-sm">
              <CardHeader className="p-6 border-b border-[#F4F4F5]">
                <CardTitle className="text-[16px] font-bold">Envío gratis</CardTitle>
                <CardDescription>Configura el umbral para ofrecer envío sin cargo.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-end gap-4 max-w-md">
                  <div className="flex-1 space-y-2">
                    <Label className="text-[13px] font-bold">Envío gratis a partir de:</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] text-[14px]">$</span>
                      <Input 
                        type="number" 
                        value={config.freeShippingThreshold} 
                        onChange={(e) => updateField('freeShippingThreshold', Number(e.target.value))}
                        className="h-10 pl-7 border-[#E4E4E7]"
                      />
                    </div>
                  </div>
                  <Button className="h-10 bg-[#0D0D0D] text-white font-bold uppercase tracking-widest text-[11px]">Guardar</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E4E4E7] shadow-sm overflow-hidden">
              <CardHeader className="p-6 border-b border-[#F4F4F5] flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[16px] font-bold">Zonas de envío</CardTitle>
                  <CardDescription>Administra los costos y tiempos por región.</CardDescription>
                </div>
                <Button variant="outline" className="h-9 gap-2 text-[11px] font-bold uppercase tracking-wider border-[#E4E4E7]">
                  <Plus size={14} />
                  Agregar zona
                </Button>
              </CardHeader>
              <Table>
                <TableHeader className="bg-[#F9F9FB]">
                  <TableRow className="hover:bg-transparent border-b border-[#F4F4F5]">
                    <TableHead className="h-12 px-6 text-[11px] font-bold uppercase tracking-wider text-[#71717A]">Zona</TableHead>
                    <TableHead className="h-12 px-6 text-[11px] font-bold uppercase tracking-wider text-[#71717A]">Tiempo estimado</TableHead>
                    <TableHead className="h-12 px-6 text-[11px] font-bold uppercase tracking-wider text-[#71717A]">Costo</TableHead>
                    <TableHead className="h-12 px-6 text-[11px] font-bold uppercase tracking-wider text-[#71717A] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.shippingZones.map((zone) => (
                    <TableRow key={zone.id} className="h-16 hover:bg-[#F9F9FB] border-b border-[#F4F4F5] transition-colors">
                      <TableCell className="px-6 text-[14px] font-bold text-[#18181B]">{zone.name}</TableCell>
                      <TableCell className="px-6 text-[13px] text-[#71717A]">{zone.time}</TableCell>
                      <TableCell className="px-6 text-[14px] font-bold text-[#18181B]">
                        {zone.cost === 0 ? (
                          <Badge className="bg-green-50 text-green-700 border-green-100 border font-bold">GRATIS</Badge>
                        ) : (
                          `$${zone.cost.toLocaleString('es-AR')}`
                        )}
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#71717A] hover:text-[#DC2626]">
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: PAGOS */}
        <TabsContent value="pagos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.paymentMethods.map((method) => (
              <Card key={method.id} className={cn(
                "border-[#E4E4E7] shadow-sm transition-all",
                method.isActive ? "ring-1 ring-[#0D0D0D]" : "opacity-70"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
                      <CreditCard size={24} />
                    </div>
                    <Switch 
                      checked={method.isActive} 
                      onCheckedChange={(v) => {
                        const newMethods = config.paymentMethods.map(m => 
                          m.id === method.id ? { ...m, isActive: v } : m
                        );
                        updateField('paymentMethods', newMethods);
                      }}
                      className="data-[state=checked]:bg-[#16A34A]"
                    />
                  </div>
                  <div className="mt-4">
                    <h4 className="text-[15px] font-bold text-[#18181B]">{method.name}</h4>
                    <p className="text-[12px] text-[#71717A] mt-1">
                      {method.isActive ? 'Activo para los clientes' : 'Inactivo'}
                    </p>
                  </div>
                  
                  {method.id === 'cards' && method.isActive && (
                    <div className="mt-6 pt-6 border-t border-[#F4F4F5] space-y-4">
                      <Label className="text-[12px] font-bold uppercase tracking-wider text-[#71717A]">Cuotas sin interés</Label>
                      <div className="flex flex-wrap gap-2">
                        {[1, 3, 6, 12].map(n => (
                          <button
                            key={n}
                            onClick={() => {
                              const current = method.installments || [];
                              const next = current.includes(n) 
                                ? current.filter(x => x !== n) 
                                : [...current, n].sort((a, b) => a - b);
                              const newMethods = config.paymentMethods.map(m => 
                                m.id === 'cards' ? { ...m, installments: next } : m
                              );
                              updateField('paymentMethods', newMethods);
                            }}
                            className={cn(
                              "h-9 px-4 rounded-md text-[12px] font-bold border transition-all",
                              method.installments?.includes(n)
                                ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                                : "bg-white text-[#71717A] border-[#E4E4E7] hover:border-[#18181B]"
                            )}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB: ANUNCIOS */}
        <TabsContent value="anuncios">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-[#E4E4E7] shadow-sm">
              <CardHeader className="p-6 border-b border-[#F4F4F5] flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[16px] font-bold">Barra de anuncios</CardTitle>
                  <CardDescription>Configura los mensajes que aparecen en la parte superior.</CardDescription>
                </div>
                <Switch 
                  checked={config.announcementBar.isActive} 
                  onCheckedChange={(v) => updateField('announcementBar.isActive', v)}
                  className="data-[state=checked]:bg-[#16A34A]"
                />
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[13px] font-bold">Mensajes (máximo 3)</Label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-[11px] font-bold uppercase tracking-wider text-[#0D0D0D]"
                      onClick={() => {
                        if (config.announcementBar.messages.length < 3) {
                          updateField('announcementBar.messages', [...config.announcementBar.messages, '']);
                        }
                      }}
                      disabled={config.announcementBar.messages.length >= 3}
                    >
                      <Plus size={14} className="mr-1" />
                      Agregar mensaje
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {config.announcementBar.messages.map((msg, i) => (
                      <div key={i} className="flex gap-2">
                        <Input 
                          value={msg} 
                          onChange={(e) => {
                            const next = [...config.announcementBar.messages];
                            next[i] = e.target.value;
                            updateField('announcementBar.messages', next);
                          }}
                          placeholder={`Mensaje ${i + 1}`}
                          className="h-10 border-[#E4E4E7]"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-10 w-10 text-[#71717A] hover:text-[#DC2626]"
                          onClick={() => {
                            const next = config.announcementBar.messages.filter((_, idx) => idx !== i);
                            updateField('announcementBar.messages', next);
                          }}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold">Color de fondo</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-10 h-10 rounded-md border border-[#E4E4E7] shadow-sm" 
                        style={{ backgroundColor: config.announcementBar.backgroundColor }} 
                      />
                      <Input 
                        value={config.announcementBar.backgroundColor} 
                        onChange={(e) => updateField('announcementBar.backgroundColor', e.target.value)}
                        className="h-10 font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold">Color de texto</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-10 h-10 rounded-md border border-[#E4E4E7] shadow-sm" 
                        style={{ backgroundColor: config.announcementBar.textColor }} 
                      />
                      <Input 
                        value={config.announcementBar.textColor} 
                        onChange={(e) => updateField('announcementBar.textColor', e.target.value)}
                        className="h-10 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E4E4E7] shadow-sm">
              <CardHeader className="p-6 border-b border-[#F4F4F5]">
                <CardTitle className="text-[16px] font-bold">Vista previa</CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px] bg-[#F9F9FB]">
                <div className="w-full space-y-8">
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#A1A1AA] text-center">Desktop</p>
                    <div 
                      className="w-full h-8 flex items-center justify-center text-[11px] font-bold tracking-widest px-4 text-center rounded shadow-sm"
                      style={{ 
                        backgroundColor: config.announcementBar.backgroundColor,
                        color: config.announcementBar.textColor,
                        opacity: config.announcementBar.isActive ? 1 : 0.3
                      }}
                    >
                      {config.announcementBar.messages[0] || 'SIN MENSAJE'}
                    </div>
                  </div>
                  <div className="space-y-2 max-w-[200px] mx-auto">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#A1A1AA] text-center">Mobile</p>
                    <div 
                      className="w-full h-10 flex items-center justify-center text-[9px] font-bold tracking-widest px-2 text-center rounded shadow-sm leading-tight"
                      style={{ 
                        backgroundColor: config.announcementBar.backgroundColor,
                        color: config.announcementBar.textColor,
                        opacity: config.announcementBar.isActive ? 1 : 0.3
                      }}
                    >
                      {config.announcementBar.messages[0] || 'SIN MENSAJE'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: AVANZADO */}
        <TabsContent value="avanzado">
          <Card className="border-[#E4E4E7] shadow-sm">
            <CardHeader className="p-6 border-b border-[#F4F4F5]">
              <CardTitle className="text-[16px] font-bold">Configuración avanzada</CardTitle>
              <CardDescription>Opciones críticas del sistema.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="p-4 border border-amber-100 bg-amber-50 rounded-lg flex gap-4">
                <Settings className="text-amber-600 flex-shrink-0" size={20} />
                <div>
                  <p className="text-[14px] font-bold text-amber-900">Modo mantenimiento</p>
                  <p className="text-[12px] text-amber-700 mt-1">
                    Al activar esta opción, la tienda mostrará una página de mantenimiento y los clientes no podrán realizar compras.
                  </p>
                  <Button variant="outline" className="mt-4 h-9 border-amber-200 text-amber-700 hover:bg-amber-100">
                    Activar mantenimiento
                  </Button>
                </div>
              </div>

              <div className="pt-6 border-t border-[#F4F4F5]">
                <p className="text-[14px] font-bold text-[#18181B]">Eliminar tienda</p>
                <p className="text-[12px] text-[#71717A] mt-1">
                  Esta acción eliminará permanentemente todos los datos de la tienda, productos, pedidos y clientes. Esta acción no se puede deshacer.
                </p>
                <Button variant="destructive" className="mt-4 h-10 font-bold uppercase tracking-widest text-[11px]">
                  Eliminar permanentemente
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
