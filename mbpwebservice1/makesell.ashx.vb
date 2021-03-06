﻿Imports System.Web
Imports System.Web.Services
Imports Newtonsoft.Json
Imports Newtonsoft.Json.Linq
Imports System.Web.Script.Serialization


Public Class makesell
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest

        Dim pvCache As New List(Of partvta)

        With context


            Try
                Dim db As New mbpDataContext

                .Request.InputStream.Seek(0, 0)

                '.Response.Write(.Request.InputStream.Length)
                Dim rl As Integer = context.Request.InputStream.Length
                Debug.Write(rl)
                Dim reader As New System.IO.StreamReader(context.Request.InputStream)
                Dim inputString As String =
                    reader.ReadToEnd()

                Dim j As JObject = JObject.Parse(inputString)

                Dim vtaId As Integer = GetID("ventas", db)
                Dim partVtaId As Integer = GetID("partvta", db)
                'Dim noRef As Integer = GetMax("consec", "ventapendiente", db)
                Dim noRef As Integer = getNoRef("ventapendiente", db)

                'Dim pid As String = j("IdVenta").ToString()
                Dim cid As String = j("ClientId").ToString()
                Dim vend As String = j("Vendedor").ToString()



                Dim c = db.clients.SingleOrDefault(Function(_c) _c.CLIENTE = cid)

                Dim pvArr = j("Partidas").ToArray()

                Dim count As Integer = 0
                Dim tc As Integer = 0

                Dim total As Single = 0.0
                Dim impuestoTotal As Single = 0.0

                For tc = 0 To pvArr.Count - 1
                    Dim data = pvArr(tc)

                    Dim cantidad As Single = Single.Parse(data("Cantidad").ToString)
                    Dim precioU As Single = Single.Parse(data("Precio").ToString)
                    Dim impuesto As Single = Single.Parse(data("Impuesto").ToString)


                    Dim precio As Double = precioU * cantidad
                    impuestoTotal = impuestoTotal + ((precioU * cantidad) * impuesto)

                    total = total + precio
                Next

                Dim v As New venta With {
                                .OCUPADO = 0,
                                .ALMACEN = 1,
                                .VENTA = vtaId,
                                .PRECIO = 1,
                                .CLIENTE = c.CLIENTE,
                                .USUFECHA = DateTime.Now.Date,
                                .USUHORA = DateTime.Now.ToString("hh:mm:ss"),
                                .IMPORTE = total,
                                .sucremota = "Local",
                                .businessintelligence = 0,
                                .cambioDeEstado = 0,
                                .Ticket = 1,
                                .CIERRE = 0,
                                .IMPUESTO = impuestoTotal,
                                .ENFAC = 0,
                                .serieDocumento = "T",
                                .TIPO_DOC = "PE",
                                .NO_REFEREN = noRef,
                                .VEND = vend,
                                .DATOS = c.NOMBRE,
                                .F_EMISION = DateTime.Now.Date,
                                .F_VENC = DateTime.Now.Date,
                                .comodin = ""
                            }

                db.ventas.InsertOnSubmit(FillVta(v))


                For count = 0 To pvArr.Count - 1
                    Dim data = pvArr(count)
                    Dim pvid = partVtaId + count

                    Dim precioStr = data("Precio").ToString().Replace(",", ".")

                    Dim precioU As Single = Single.Parse(precioStr, System.Globalization.CultureInfo.InvariantCulture)
                    Dim cantidad As Single = Single.Parse(data("Cantidad"), System.Globalization.CultureInfo.InvariantCulture)
                    Dim impuesto As Single = Single.Parse(data("Impuesto"), System.Globalization.CultureInfo.InvariantCulture)
                    Dim prcantidad As Single = 1
                    Dim prdescrip As String = ""

                    If data("Prcantidad") IsNot Nothing Then
                        prcantidad = Single.Parse(data("Prcantidad"), System.Globalization.CultureInfo.InvariantCulture)
                    End If

                    If data("Prdescrip") IsNot Nothing Then
                        prdescrip = data("Prdescrip")
                    End If

                    Dim artStr As String = (data("Articulo")).ToString()

                    Dim precio As Double = precioU
                    Console.WriteLine(precio)

                    Dim taxFactor = impuesto / 100

                    Dim p = db.prods.SingleOrDefault(Function(_p) _p.ARTICULO = artStr)

                    Console.WriteLine(precio)

                    Dim pv As New partvta With {
                                 .PRECIO = Math.Round(precio, 3),
                                 .ALMACEN = 1,
                                 .ARTICULO = p.ARTICULO,
                                 .VENTA = v.VENTA,
                                 .COSTO = p.COSTO,
                                 .CANTIDAD = cantidad,
                                 .DESCUENTO = 0,
                                 .IMPUESTO = impuesto * 100,
                                 .ID_SALIDA = pvid,
                                 .PrecioBase = precioU,
                                 .Devolucion = 0,
                                 .DevConf = 0,
                                 .ID_entrada = 0,
                                 .Invent = 0,
                                 .importe = (precio + (precio * taxFactor)),
                                 .kit = 0,
                                 .costo_u = p.COSTO,
                                 .iespecial = 0,
                                 .colores = 0,
                                 .verificado = 0,
                                 .A01 = 0,
                                 .serieDocumento = 0,
                                 .TIPO_DOC = "PE",
                                 .OBSERV = p.DESCRIP,
                                 .UsuHora = DateTime.Now.ToString("hh:mm:ss"),
                                 .UsuFecha = DateTime.Now.Date,
                                 .Usuario = "SUP",
                                 .estado = "PE",
                                 .PRCANTIDAD = prcantidad,
                                 .PRDESCRIP = prdescrip
                                 }

                    db.partvtas.InsertOnSubmit(pv)
                    pvCache.Add(pv)

                Next


                Dim json As New JavaScriptSerializer()


                Try
                    db.SubmitChanges()
                    .Response.Write(json.Serialize(v))
                    .Response.StatusCode = 200
                Catch ex As Exception
                    Dim err = New With {.m = ex.Message, .v = v, .pv = pvCache}
                    context.Response.Write(err)
                End Try
            Catch ex As Exception

                Dim json As New JavaScriptSerializer

                Debug.WriteLine("==" & ex.Message)

                Dim err As New With {.error = ex.Message,
                    .stackTrace = ex.StackTrace}

                context.Response.Clear()
                context.Response.Write(json.Serialize(err))
                .Response.StatusCode = 500


            End Try


        End With


    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

    Public Function FillVta(ByVal v As venta) As venta
        With v
            .DESC1 = 0
            .DESC2 = 0
            .DESC3 = 0
            .DESC4 = 0
            .DESC5 = 0
            .MONEDA = "MN"
            .OBSERV = ""

            .pago4 = 0
            .concepto4 = "EFE"
            .donativo = 0
            .iespecial = 0
            .redondeo = 0
            .interes = 0
            .estacion = "ESTACION01"
            .Corte = "N"
            .Caja = "ESTACION01"
            .Comision = 0
            .Concepto3 = ""
            .Pago3 = 0

            .Concepto2 = ""
            .Concepto1 = "EFE"
            .Pago2 = 0
            .Pago1 = 0
            .SUCURSAL = ""
            .Exportado = 0
            .TipoVenta = ""
            .AplicarDes = 1
            .Relacion = "(Al mismo)"
            .USUHORA = DateTime.Now.ToString("hh:mm:ss")
            .USUARIO = "SUP"

            .PRECIO = 1
            .ESTADO = "PE"
            .DESCUENTO = 0
            .COSTO = 0
            .TIPO_CAM = 1





        End With

        Return v
    End Function

    Public Function FillPva(pv As partvta) As partvta

    End Function

    Public Function GetID(ByVal Table As String, db As mbpDataContext) As Integer
        Dim cmdStr As String = String.Format("SELECT IDENT_CURRENT('{0}')", Table)
        Dim cmd = Convert.ToInt32(db.ExecuteQuery(Of Decimal)(cmdStr, New Object() {}).FirstOrDefault)
        Dim id As Integer = cmd + 1

        Return id

    End Function

    Public Function GetMax(ByVal Table As String, row As String, db As mbpDataContext) As Integer
        Dim cmdStr As String = String.Format("select Max({1}) as Consec from {0}", Table, row)
        Dim cmd = Convert.ToInt32(db.ExecuteQuery(Of Integer)(cmdStr, New Object() {}).FirstOrDefault)
        Dim id As Integer = cmd + 1

        Return id

    End Function

    Public Function getNoRef(ByVal scope As String, db As mbpDataContext) As Integer
        Dim dato = db.consecs.Single(Function(c) c.Dato = scope)
        Dim consec = dato.Consec
        dato.Consec += 1
        db.SubmitChanges()
        Return consec
    End Function

    Public Sub updateNoRef(ByVal scope As String, db As mbpDataContext)
        Dim dato = db.consecs.Single(Function(c) c.Dato = scope)
        dato.Consec += 1
        db.SubmitChanges()

    End Sub

End Class