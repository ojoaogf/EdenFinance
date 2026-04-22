import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const years = Array.from({ length: 20 }, (_, i) => 2020 + i);

interface SmartDatePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
}

export function SmartDatePicker({
  date,
  onSelect,
  placeholder = "Selecione uma data",
}: SmartDatePickerProps) {
  const [monthNav, setMonthNav] = useState<Date>(date || new Date());

  // Atualiza a navegação quando a data externa mudar
  useEffect(() => {
    if (date) {
      setMonthNav(date);
    }
  }, [date]);

  const formatDate = (d?: Date) =>
    d ? format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : placeholder;

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Correção para o problema de fuso horário: definir hora para 12:00
      // Isso evita que a conversão para UTC ou fuso local altere o dia
      const adjustedDate = new Date(selectedDate);
      adjustedDate.setHours(12, 0, 0, 0);
      onSelect(adjustedDate);
    } else {
      onSelect(undefined);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDate(date)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 pointer-events-auto">
          <div className="flex gap-2 mb-3">
            <Select
              value={String(monthNav.getMonth())}
              onValueChange={(v) => {
                const d = new Date(monthNav);
                d.setMonth(Number(v));
                setMonthNav(d);
              }}
            >
              <SelectTrigger className="flex-1 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(monthNav.getFullYear())}
              onValueChange={(v) => {
                const d = new Date(monthNav);
                d.setFullYear(Number(v));
                setMonthNav(d);
              }}
            >
              <SelectTrigger className="w-24 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            month={monthNav}
            onMonthChange={setMonthNav}
            className="p-0"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
