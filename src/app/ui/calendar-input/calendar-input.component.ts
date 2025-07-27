import { Component, Input, Output, EventEmitter, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-input.component.html',
  styleUrl: './calendar-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarInputComponent),
      multi: true
    }
  ]
})
export class CalendarInputComponent implements OnInit, ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Selecciona una fecha';
  @Input() disabled: boolean = false;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Input() control?: FormControl;

  @Output() dateSelected = new EventEmitter<Date>();

  currentDate = new Date();
  selectedDate: Date | null = null;
  isOpen = false;
  
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  daysInMonth: number[] = [];
  monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // ControlValueAccessor
  private onChange = (value: Date | null) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar();
  }

  writeValue(value: Date | null): void {
    this.selectedDate = value;
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleCalendar() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.onTouched();
      }
    }
  }

  selectDate(day: number) {
    const selected = new Date(this.currentYear, this.currentMonth, day);
    
    // Verificar si la fecha está dentro del rango permitido
    if (this.minDate && selected < this.minDate) return;
    if (this.maxDate && selected > this.maxDate) return;

    this.selectedDate = selected;
    this.onChange(selected);
    this.dateSelected.emit(selected);
    this.isOpen = false;
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    
    this.daysInMonth = [];
    
    // Agregar días vacíos del mes anterior
    for (let i = 0; i < firstDay; i++) {
      this.daysInMonth.push(0);
    }
    
    // Agregar días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      this.daysInMonth.push(day);
    }
  }

  isDateDisabled(day: number): boolean {
    if (day === 0) return true;
    
    const date = new Date(this.currentYear, this.currentMonth, day);
    
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    
    return false;
  }

  isDateSelected(day: number): boolean {
    if (!this.selectedDate || day === 0) return false;
    
    return this.selectedDate.getDate() === day &&
           this.selectedDate.getMonth() === this.currentMonth &&
           this.selectedDate.getFullYear() === this.currentYear;
  }

  isToday(day: number): boolean {
    if (day === 0) return false;
    
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === this.currentMonth &&
           today.getFullYear() === this.currentYear;
  }

  formatSelectedDate(): string {
    if (!this.selectedDate) return this.placeholder;
    
    const day = this.selectedDate.getDate().toString().padStart(2, '0');
    const month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = this.selectedDate.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  closeCalendar() {
    this.isOpen = false;
  }
}
