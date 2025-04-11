import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { InputComponent } from '../../ui/input/input.component';
import { SelectComponent } from '../../ui/select/select.component';
import { CheckboxComponent } from '../../ui/checkbox/checkbox.component';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    SelectComponent,
    CheckboxComponent
  ],
  templateUrl: './create-user.component.html',
  styleUrl: './create-user.component.scss'
})
export class CreateUserComponent {
  private _fb = inject(NonNullableFormBuilder);

  tiposDocumentos: any[] = [
    { id: 'DNI', nombre: 'DNI' }
  ];

  constructor(
    private authService: AuthService,
    private fs: FirestoreService) {}

  public form = this._fb.group({
    nombre: this._fb.control<string>('', [Validators.required]),
    apellido: this._fb.control<string>('', [Validators.required]),
    tipo_documento: this._fb.control<string>('', [Validators.required]),
    nro_documento: this._fb.control<string>('', [Validators.required]),
    celular: this._fb.control<string>('', [Validators.required]),
    correo: this._fb.control<string>('', [Validators.required, Validators.email]),
    contraseña: this._fb.control<string>('', [Validators.required, Validators.minLength(8)]),
    rep_contraseña: this._fb.control<string>('', [Validators.required, Validators.minLength(8)]),
    terminos_cond: this._fb.control<boolean>(false, [Validators.required]),
    politicas_priv: this._fb.control<boolean>(false, [Validators.required]),
    rol: this._fb.control<string>('ESTUDIANTE', [Validators.required]),
  });

  registrar() {
    if (this.form.valid) {

      const { correo, contraseña } = this.form.value;

      this.authService.registrarUsuario(correo!, contraseña!)
      .then(() => {
        this.fs.addUser(this.form.value)
          .then(() => {
            console.log('Usuario registrado y datos guardados!');
            this.form.reset();
          }).catch(err => console.error('Error al guardar:', err));
      })
      .catch(err => {
        console.error('Error al registrar:', err);
      });
    } else {
      console.log('Formulario inválido');
    }
  }
}
