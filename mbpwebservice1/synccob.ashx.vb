Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization

Public Class synccob
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest
        Dim db As New mbpDataContext

        Dim cob As String = context.Request.QueryString("cob")
        Dim operation As String = context.Request.QueryString("op")
        Dim client As String = ""
        Dim json As New JavaScriptSerializer


        Select Case operation
            Case "synccob"

                Dim future As Date = DateTime.Now.AddDays(7).Date

                Dim q = From cli In db.clients, cobr In db.cobranzas
                        Where cli.COBRADOR = cob And cobr.CLIENTE = cli.CLIENTE And cobr.SALDO > 0 And cobr.FECHA_VENC < future
                        Select New With {
                            .CLIENTE = cobr.CLIENTE,
                            .COBRANZA = cobr.COBRANZA,
                            .fecha = cobr.FECHA,
                            .NO_FEREFEREN = cobr.NO_REFEREN,
                            .FECHA_VENC = cobr.FECHA_VENC.Value.ToShortDateString,
                            .SALDO = cobr.SALDO,
                            .VENTA = cobr.VENTA,
                            .cobdet =
                                From cd In db.cobdets
                                Where cd.COBRANZA = cobr.COBRANZA
                                Select New With {
                                        .id = cd.id,
                                        .COBRANZA = cd.COBRANZA,
                                        .CLIENTE = cd.CLIENTE,
                                        .NO_REFEREN = cd.NO_REFEREN,
                                        .VENTA = cd.VENTA,
                                        .IMPORTE = cd.IMPORTE,
                                        .FECHA =
                                            cd.FECHA.Value.ToShortDateString
                                        }
                            }

                context.Response.Write(json.Serialize(q))

            Case "cobbyclient"

                client = context.Request.QueryString("cl")

                Dim q = From cobr In db.cobranzas
                        Where cobr.CLIENTE = client And cobr.SALDO > 0
                        Select New With {
                                .CLIENTE = cobr.CLIENTE,
                                .cobranza = cobr.COBRANZA,
                                .fecha = cobr.FECHA,
                                .NO_FEREFEREN = cobr.NO_REFEREN,
                                .FECHA_VENC = cobr.FECHA_VENC.Value.ToShortDateString,
                                .SALDO = cobr.SALDO,
                                .VENTA = cobr.VENTA,
                                .cobdet =
                                    From cd In db.cobdets
                                    Where cd.COBRANZA = cobr.COBRANZA
                                    Select New With {
                                            .id = cd.id,
                                            .COBRANZA = cd.COBRANZA,
                                            .CLIENTE = cd.CLIENTE,
                                            .NO_REFEREN = cd.NO_REFEREN,
                                            .VENTA = cd.VENTA,
                                            .IMPORTE = cd.IMPORTE,
                                            .FECHA =
                                                cd.FECHA.Value.ToShortDateString
                                            }
                                }

                context.Response.Write(json.Serialize(q))

            Case "getcob"

                Dim cobranza = context.Request.QueryString("cobranza")

                Dim q = From cobr In db.cobranzas
                        Where cobr.COBRANZA = cobranza
                        Select New With {
                                .CLIENTE = cobr.CLIENTE,
                                .cobranza = cobr.COBRANZA,
                                .fecha = cobr.FECHA,
                                .NO_FEREFEREN = cobr.NO_REFEREN,
                                .FECHA_VENC = cobr.FECHA_VENC.Value.ToShortDateString,
                                .SALDO = cobr.SALDO,
                                .VENTA = cobr.VENTA,
                                .cobdet =
                                    From cd In db.cobdets
                                    Where cd.COBRANZA = cobr.COBRANZA
                                    Select New With {
                                            .id = cd.id,
                                            .COBRANZA = cd.COBRANZA,
                                            .CLIENTE = cd.CLIENTE,
                                            .NO_REFEREN = cd.NO_REFEREN,
                                            .VENTA = cd.VENTA,
                                            .IMPORTE = cd.IMPORTE,
                                            .FECHA =
                                                cd.FECHA.Value.ToShortDateString
                                            }
                                }

                context.Response.Write(json.Serialize(q))



        End Select


        'Dim q = From cl In db.clients
        '        Where cl.COBRADOR = cob
        '        Select New With {
        '            .Cobranza = (From c In db.cobranzas
        '                         Where c.CLIENTE = cl.CLIENTE
        '                         Select New With {
        '                             .client = c.CLIENTE,
        '                             .cobId = c.COBRANZA,
        '                             .cob = New With {
        '                                .COBRANZA = c.COBRANZA,
        '                                .CLIENTE = c.CLIENTE,
        '                                .FECHA = c.CLIENTE,
        '                                .NO_REFEREN = c.NO_REFEREN,
        '                                .VENTA = c.VENTA,
        '                                .FECHA_VENC =
        '                                    c.FECHA_VENC.Value.ToShortDateString,
        '                                .SALDO = c.SALDO,
        '                                .cobdet =
        '                                    From cd In db.cobdets
        '                                    Where cd.COBRANZA = c.COBRANZA
        '                                    Select New With {
        '                                        .id = cd.id,
        '                                        .COBRANZA = cd.COBRANZA,
        '                                        .CLIENTE = cd.CLIENTE,
        '                                        .NO_REFEREN = cd.NO_REFEREN,
        '                                        .VENTA = cd.VENTA,
        '                                        .IMPORTE = cd.IMPORTE,
        '                                        .FECHA =
        '                                            cd.FECHA.Value.ToShortDateString
        '                                    }
        '                             }
        '                             }).AsEnumerable
        '            }












        'If ([single] = True) Then
        '    Dim result = json.Serialize(q.Single)
        '    context.Response.Write(result)
        'Else
        '    Dim l = (From item In q.ToList Where item.Cobranza.Count > 0).ToList

        '    context.Response.Write(json.Serialize(l))
        'End If

    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class